const fileSizeLimit = (req, res, next) => {
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

  const checkFileSize = (file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.fieldname} exceeds the limit of 3 MB`);
    }
  };

  try {
    if (req.file) {
      checkFileSize(req.file);
    }

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(checkFileSize);
      } 
      else {
        Object.values(req.files).forEach(files => {
          files.forEach(checkFileSize);
        });
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export default fileSizeLimit;