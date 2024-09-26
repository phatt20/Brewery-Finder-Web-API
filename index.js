import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://api.openbrewerydb.org/v1/breweries";


const yourBearerToken = "";
const config = {
    headers: { Authorization: `Bearer ${yourBearerToken}` },
};

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs", { content: "Waiting for data..." });
});

app.post("/random", async (req, res) => {
    try {
        const result = await axios.get(API_URL + "/random");
        res.render("index.ejs", { content: JSON.stringify(result.data) });
    } catch (error) {
        res.render("index.ejs", { content: JSON.stringify(error.response.data) });
    }
});

app.post("/bycity", async (req, res) => {
    const city = req.body.city;
    const per_page = req.body.per_page;

    // ตรวจสอบว่าผู้ใช้กรอกข้อมูลทั้ง city และ per_page
    if (!city || !per_page) {
        const errorMessage = !city ? "กรุณากรอกชื่อเมือง" : "กรุณากรอกจำนวนหน้า";
        return res.render("index.ejs", { content: errorMessage });
    }

    try {
        const formattedCity = city.replace(/\s+/g, '_');
        const formattedPerPage = per_page.replace(/\s+/g, '_');

        const result = await axios.get(`https://api.openbrewerydb.org/v1/breweries?by_city=${formattedCity}&per_page=${formattedPerPage}`);

        if (!result.data || !result.data.length) {
            return res.render("index.ejs", { content: "ไม่พบข้อมูลโรงเบียร์ในเมืองที่ระบุ" });
        }

        res.render("index.ejs", { content: JSON.stringify(result.data) });
    } catch (error) {
        
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.render("index.ejs", { content: `เกิดข้อผิดพลาด: ${errorMessage}` });
    }
});



app.post("/bycoordinates", async (req, res) => {
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);
    const per_page = req.body.per_page;

    // ตรวจสอบว่าผู้ใช้กรอกข้อมูลทั้ง latitude, longitude และ per_page
    if (!latitude || !longitude || !per_page) {
        const errorMessage = !latitude ? "กรุณากรอก latitude" : !longitude ? "กรุณากรอก longitude" : "กรุณากรอกจำนวนหน้า";
        return res.render("index.ejs", { content: errorMessage });
    }

    try {
        // สร้าง URL สำหรับ API โดยใช้ค่าที่ผู้ใช้กรอก
        const result = await axios.get(`https://api.openbrewerydb.org/v1/breweries?by_dist=${latitude},${longitude}&per_page=${per_page}`);

        // ตรวจสอบว่ามีข้อมูลในผลลัพธ์หรือไม่
        if (!result.data || !result.data.length) {
            return res.render("index.ejs", { content: "ไม่พบข้อมูลโรงเบียร์ในพิกัดที่ระบุ" });
        }

        res.render("index.ejs", { content: JSON.stringify(result.data) });
    } catch (error) {
        // จัดการข้อผิดพลาดในการเรียก API
        const errorMessage = error.response ? error.response.data.message : error.message;
        return res.render("index.ejs", { content: `เกิดข้อผิดพลาด: ${errorMessage}` });
    }
});

app.post("/by_ids", async (req, res) => {
    const searchId = req.body.id;

    if (!searchId) {
        const errorMessage = !city ? "กรุณากรอก id" : "";
        return res.render("index.ejs", { content: errorMessage });
    }

    try {
        const formattedCity = searchId.replace(/\s+/g, '_');

        const result = await axios.get(`https://api.openbrewerydb.org/v1/breweries?by_ids=${searchId}`);

        if (!result.data || !result.data.length) {
            return res.render("index.ejs", { content: "ไม่พบข้อมูลโรงเบียร์ในเมืองที่ระบุ" });
        }

        res.render("index.ejs", { content: JSON.stringify(result.data) });
    } catch (error) {
        
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.render("index.ejs", { content: `เกิดข้อผิดพลาด: ${errorMessage}` });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
