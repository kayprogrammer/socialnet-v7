import { PipelineStage, Types } from "mongoose";
import { ICity, ICountry, IState, IUser, User } from "../models/accounts";
import { Friend, IFriend, FRIEND_REQUEST_STATUS_CHOICES, NOTIFICATION_TYPE_CHOICES, Notification } from "../models/profiles";
import { getFileUrl } from "../models/utils";
import { NotFoundError } from "../config/handlers";

const findUsersSortedByProximity = async (user: IUser | null ) => {
    if (!user || !user.city_) return await User.find().populate(["avatar", "city_"]);

    let city = user.city_ as ICity;
    let state = city.state_ as IState;
    let country = state.country_ as ICountry;

    // Aggregation pipeline to sort users by city, state, and country
   
    const pipeline: PipelineStage[] = [
        {
          $match: {
            _id: { $ne: user._id }, // Exclude current user
          },
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'city_',
            foreignField: '_id',
            as: 'city',
          },
        },
        {
          $unwind: {
            path: '$city',
            preserveNullAndEmptyArrays: true, // Include users without city details
          },
        },
        {
          $lookup: {
            from: 'states',
            localField: 'city.state_',
            foreignField: '_id',
            as: 'state',
          },
        },
        {
          $unwind: {
            path: '$state',
            preserveNullAndEmptyArrays: true, // Include users without state details
          },
        },
        {
          $lookup: {
            from: 'countries',
            localField: 'state.country_',
            foreignField: '_id',
            as: 'country',
          },
        },
        {
          $unwind: {
            path: '$country',
            preserveNullAndEmptyArrays: true, // Include users without country details
          },
        },
        {
          // Populate avatar
          $lookup: {
            from: 'files', 
            localField: 'avatar',
            foreignField: '_id',
            as: 'avatar',
          },
        },
        { $unwind: { path: '$avatar', preserveNullAndEmptyArrays: true } }, // Preserve users without avatars
        {
          // Set proximity values
          $addFields: {
            _tmp: {
              cityMatch: { $cond: [{ $eq: ['$city._id', city._id] }, 0, 1] }, // 0 if same city, 1 otherwise
              stateMatch: { $cond: [{ $eq: ['$state._id', state._id] }, 0, 1] }, // 0 if same state
              countryMatch: { $cond: [{ $eq: ['$country._id', country._id] }, 0, 1] }, // 0 if same country
            },
          },
        },
        {
          // Sort by proximity order
          $sort: {
            '_tmp.cityMatch': 1,  // Closest city first
            '_tmp.stateMatch': 1, // Then closest state
            '_tmp.countryMatch': 1, // Then closest country
          },
        },
        {
          // Remove temporary fields
          $unset: '_tmp',
        },
    ];
    
    const sortedUsers = await User.aggregate(pipeline);
    // Process results to include generated URLs
    const processedUsers = sortedUsers.map(user => {
      return {
        ...user,
        avatarUrl: getFileUrl(user.avatar, "avatars"), // Call your function here
        city: user.city.name, // Assuming you still want city name
      };
    });
    return processedUsers;
};

const findFriends = async (userId: Types.ObjectId) => {
  // Find all accepted friends (where user is either requester or requestee)
  const friendsPipeline: PipelineStage[] = [
    {
        $match: {
            status: FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED,
            $or: [
              { requester: userId }, 
              { requestee: userId }
            ]
        }
    },
    // Add a field `friend_id` that contains the other user in the relationship
    {
        $addFields: {
            friend_id: {
                $cond: {
                  if: { $eq: ['$requester', userId] },  // If user is the requester, pick requestee as friend
                  then: '$requestee',
                  else: '$requester' // Else pick requester as friend
                }
            }
        }
    },
    // Project only the `friend_id` field
    {
        $project: { friend_id: 1 }
    }
  ];
  let friendIds = await Friend.aggregate(friendsPipeline)
  const friendIdList = friendIds.map(friend => friend.friend_id);

  // Query the `User` collection with the friend IDs and populate fields
  const users = await User.find({ _id: { $in: friendIdList } }).populate(['city_', 'avatar'])
  return users
}

const findRequesteeAndFriendObj = async (user: IUser, username: string, status: string | null = null): Promise<{ otherUser: IUser, friend: IFriend | null }> => {
  const otherUser = await User.findOne({ username }) 
  if (!otherUser) throw new NotFoundError("User does not exist")
    const friendFilter: Record<string, any> = { 
    $or: [
      { requester: user._id, requestee: otherUser._id },
      { requester: otherUser._id, requestee: user._id }
    ]
  }
  if (status) friendFilter.status = status
  const friend = await Friend.findOne(friendFilter)
  return { otherUser, friend }

}

export { findUsersSortedByProximity, findFriends, findRequesteeAndFriendObj }