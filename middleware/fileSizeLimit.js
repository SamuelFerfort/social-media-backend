const fileSizeLimit = (req, res, next) => {
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB
  
    if (req.file && req.file.size > MAX_FILE_SIZE) {
      return res
        .status(400)
        .json({ message: "File size exceeds the limit of 3 MB" });
    }
    next();
  };
  
  
  module.exports = fileSizeLimit