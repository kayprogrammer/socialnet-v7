"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateRecords = exports.paginateModel = void 0;
const paginateModel = async (req, modelClass, filter = {}, populateData, sortData = { createdAt: -1 }) => {
    // paginate data from the model
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 100; // Default to 100 items per page
    const skip = (page - 1) * limit;
    // Get total count of items
    const itemsCount = await modelClass.countDocuments(filter);
    // Get paginated items
    const items = await modelClass.find(filter).populate(populateData).skip(skip).limit(limit).sort(sortData);
    const totalPages = Math.ceil(itemsCount / limit);
    return { items, page, itemsCount, totalPages, itemsPerPage: limit };
};
exports.paginateModel = paginateModel;
const paginateRecords = async (req, records) => {
    // Paginate records
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 100; // Default to 100 items per page
    const skip = (page - 1) * limit;
    // Get total count of items
    const itemsCount = records.length;
    // Get paginated items
    const paginatedItems = records.slice(skip, skip + limit);
    const totalPages = Math.ceil(itemsCount / limit);
    return { items: paginatedItems, page, itemsCount, totalPages, itemsPerPage: limit };
};
exports.paginateRecords = paginateRecords;
//# sourceMappingURL=paginator.js.map