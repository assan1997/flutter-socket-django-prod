const path = require('path');
const multer = require('multer');
const profil = multer({
  storage: addStorage('./ImageProfil', 'Profil'),
  limits: { fileSize: 1000000 },
}).single('profil');

const msgimage = multer({
  storage: addStorage('./MsgImage', 'msg'),
  limits: { fileSize: 1000000 },
}).single('photo');

const msgvideo = multer({
  storage: addStorage('./MsgVideo', 'msg'),
  limits: { fileSize: 1000000 },
}).single('video');

function addStorage(storagePath, fileStartName) {
  const storage = multer.diskStorage({
    destination: `./${storagePath}`,
    filename: function (req, file, cb) {
      cb(
        null,
        `${fileStartName}-` + Date.now() + path.extname(file.originalname)
      );
    },
  });
  return storage;
}

module.exports = { profil, msgimage, msgvideo };
