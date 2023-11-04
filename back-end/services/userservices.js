const getExpenses = (req, where) => req.user.getExpenses(where);

const saveFileUrl = (req, fileUrl) => req.user.createDownloadedFile({fileUrl});

module.exports = {
    getExpenses,
    saveFileUrl
}