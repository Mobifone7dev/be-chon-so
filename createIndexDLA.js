
import client from "./src/config/elastic.js";

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
createIndexDLA();