
const client = require("../config/elastic.js");
const XLSX = require("xlsx");
const path = require("path");

const createIndexDLA = async () => {
    const indexName = "kho-dla";
    const exists = await client.indices.exists({ index: indexName });

    if (exists) {
        console.log("Index đã tồn tại:", indexName);
        return;
    }

    const response = await client.indices.create({
        index: indexName,
        body: {
            settings: {
                number_of_shards: 1,
                number_of_replicas: 0
            },
            mappings: {
                properties: {
                    phone: { type: "keyword" },
                    type: { type: "keyword" },
                    loai_ck: { type: "keyword" }
                }
            }
        }
    });

    console.log("Tạo index thành công:", response);
}
async function insertData() {
    // Lấy đường dẫn tuyệt đối đến file Excel trong thư mục public
    const filePath = path.join(__dirname, "src", "rawData", "number-dla.xlsx");

    console.log("Đang đọc file:", filePath);

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Tổng số dòng: ${rows.length}`);

    // Dữ liệu bulk
    const bulkBody = [];

    rows.forEach(row => {
        const phone = row.phone;
        const type = row.type;
        const loai_ck = row.loai_ck;

        bulkBody.push({
            index: { _index: "kho-dla" }
        });

        bulkBody.push({
            phone,
            type,
            loai_ck
        });
    });

    try {
        const resp = await client.bulk({
            refresh: true,
            body: bulkBody
        });

        console.log("Insert thành công!");
    } catch (error) {
        console.error("Lỗi khi bulk insert:", error.meta?.body?.error || error);
    }
}

insertData();