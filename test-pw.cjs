const bcrypt = require('bcryptjs');

async function test() {
  const hash1 = '$2b$10$9EzkQuAmpqw0vVR0hY3IneCsYcqoXDMh1vg4bnPcRM9i8jPiMtP7q';
  const valid1 = await bcrypt.compare('admin', hash1);
  const valid2 = await bcrypt.compare('admin123', hash1);
  console.log("admin:", valid1);
  console.log("admin123:", valid2);
}
test();
