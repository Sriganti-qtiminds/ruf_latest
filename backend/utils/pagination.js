function paginate(array, page = 1, perPage = 20) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalRecords = array.length;
    const totalPages = Math.ceil(totalRecords / perPage);

    return {
        pagination: {
            currentPage: page,
            totalPages,
            totalRecords,
            limit: perPage
        },
        results: array.slice(start, end)
    };
}

module.exports = paginate;
