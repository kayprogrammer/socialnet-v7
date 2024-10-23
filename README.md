# SOCIALNET V7

![alt text](https://github.com/kayprogrammer/socialnet-v7/blob/main/display/disp1.png?raw=true)


#### EXPRESS DOCS: [Documentation](https://expressjs.com/)
#### TYPESCRIPT DOCS: [Documentation](https://www.typescriptlang.org/docs/)
#### MONGOOSE DOCS: [Documentation](https://mongoosejs.com/docs/) 

## Key Features
***Authentication and Authorization***: Secure your application with robust JWT-based authentication and authorization, ensuring that only authorized users can access protected resources.

***Password Reset***: Provides a straightforward password reset process, allowing users to regain access to their accounts quickly and securely.

***Account Verification***: Ensures user authenticity through email verification, enhancing the security of user accounts and preventing fraudulent activities.

***Feed Management***: Allows users to create, update, and delete posts, enabling a dynamic feed that fosters interaction and engagement. Includes functionalities for comments, replies, and reactions to posts, creating a vibrant social experience.

***Profile Management***: Users can find other users, search by cities, and manage their friends list. Features include sending and accepting friend requests, facilitating connections among users.

***Real-Time Notifications***: Keeps users informed with real-time notifications, allowing them to view and read updates without delay, enhancing user engagement.

***Real-Time Chats***: Supports direct messages (DMs) and group chats, with real-time message sending, updating, and deletion capabilities. Users can easily create, update, and delete group chats, facilitating seamless communication within the platform.


## How to run locally
* Download this repo or run: 
```bash
    $ git clone git@github.com:kayprogrammer/socialnet-v7.git
```

#### In the root directory:
- Install all dependencies
```bash
    $ npm install
```
- Create an `.env` file and copy the contents from the `.env.example` to the file and set the respective values.

- Generate initial data
```bash
    $ npm run seed
```
OR
```bash
    $ make init
```
- Run Locally
```bash
    $ npm run dev
```
OR
```bash
    $ make run
```

- Run With Docker
```bash
    $ docker-compose up --build -d --remove-orphans
```
OR
```bash
    $ make build
```

- Test Coverage
```bash
    $ npm run test
```
OR
```bash
    $ make test
```

## Docs
#### API Url: [Socialnet Swagger Docs](https://socialnet-express.fly.dev/) 

![alt text](https://github.com/kayprogrammer/socialnet-v7/blob/main/display/disp2.png?raw=true)

![alt text](https://github.com/kayprogrammer/socialnet-v7/blob/main/display/disp3.png?raw=true)

![alt text](https://github.com/kayprogrammer/socialnet-v7/blob/main/display/disp4.png?raw=true)

![alt text](https://github.com/kayprogrammer/socialnet-v7/blob/main/display/disp5.png?raw=true)