//ghi đè các cấu hình webpack được ẩn đi bởi create-react-app

const { override, useBabelRc } = require("customize-cra");

module.exports = override(useBabelRc());