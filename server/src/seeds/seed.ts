import mongoose from "mongoose";
import { connectDb, disconnectDb } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Review } from "../models/Review";
import { Reply } from "../models/Reply";
import { RefreshToken } from "../models/RefreshToken";
import { hashPassword } from "../utils/hash";
import { slugify } from "../utils/sanitize";

async function seed() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Reply.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);

  const adminPass = await hashPassword("Admin@123");
  const staffPass = await hashPassword("Staff@123");
  const customerPass = await hashPassword("Customer@123");

  const [admin, staff, ...customers] = await User.create([
    { name: "RFMS Admin", email: "admin@rfms.local", password: adminPass, role: "ADMIN" },
    { name: "Linh Staff", email: "staff@rfms.local", password: staffPass, role: "STAFF" },
    { name: "Minh Customer", email: "customer1@rfms.local", password: customerPass, role: "CUSTOMER" },
    { name: "Hoa Customer", email: "customer2@rfms.local", password: customerPass, role: "CUSTOMER" },
    { name: "Nam Customer", email: "customer3@rfms.local", password: customerPass, role: "CUSTOMER" },
  ]);

  const categoryNames = [
    ["Đồ uống & Giải khát", "Nước ép trái cây, nước ngọt có ga"],
    ["Cà phê & Trà", "Cà phê rang xay, trà hoa sen khô"],
    ["Lương thực & Đồ khô", "Gạo sạch, mì gói cao cấp"],
    ["Gia vị & Dầu ăn", "Nước mắm truyền thống, dầu thực vật"],
    ["Sữa & Sản phẩm từ sữa", "Sữa tươi tiệt trùng, sữa chua uống men sống"],
    ["Bánh kẹo & Ăn vặt", "Bánh quy bơ, chocolate đen"],
    ["Chăm sóc cá nhân", "Dầu gội bưởi, kem đánh răng than tre"],
    ["Gia dụng & Nhà bếp", "Nồi inox 3 đáy, chảo chống dính đá"],
    ["Rau củ & Trái cây", "Táo đỏ Fuji, chuối tiêu chín vàng"],
    ["Điện tử & Phụ kiện", "Tai nghe không dây Bluetooth, củ sạc nhanh"],
  ];

  const categories = await Category.create(
    categoryNames.map(([name, description]) => ({
      name,
      slug: slugify(name),
      description,
      isActive: true,
    })),
  );

  const productDefs = [
    [
      "Nước cam ép tép tươi 1L",
      32000,
      0,
      "JUC-001",
      80,
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800",
    ],
    [
      "Nước ngọt có ga Coca-Cola 1.5L",
      22000,
      0,
      "COCA-002",
      120,
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800",
    ],
    [
      "Cà phê rang xay Arabica Cầu Đất 250g",
      129000,
      1,
      "CF-003",
      40,
      "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800",
    ],
    [
      "Trà sen Tây Hồ thượng hạng 100g",
      89000,
      1,
      "TEA-004",
      55,
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800",
    ],
    [
      "Gạo ST25 tiến vua túi 5kg",
      175000,
      2,
      "RICE-005",
      30,
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
    ],
    [
      "Mì ăn liền hải sản thùng 30 gói",
      118000,
      2,
      "NOOD-006",
      24,
      "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800",
    ],
    [
      "Nước mắm cá cơm Phú Quốc 500ml",
      56000,
      3,
      "FISH-007",
      60,
      "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800",
    ],
    [
      "Dầu ăn đậu nành nguyên chất 1L",
      48000,
      3,
      "OIL-008",
      50,
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
    ],
    [
      "Sữa tươi tiệt trùng không đường 1L",
      35000,
      4,
      "MILK-009",
      70,
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800",
    ],
    [
      "Sữa chua uống men sống lốc 4 chai",
      28000,
      4,
      "YOG-010",
      90,
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
    ],
    [
      "Bánh quy bơ hộp thiếc 300g",
      62000,
      5,
      "CKE-011",
      45,
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800",
    ],
    [
      "Chocolate đen nguyên chất 70% 100g",
      49000,
      5,
      "CHO-012",
      65,
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800",
    ],
    [
      "Dầu gội bưởi thảo mộc 650ml",
      98000,
      6,
      "SHP-013",
      35,
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800",
    ],
    [
      "Kem đánh răng than tre trắng răng 150g",
      42000,
      6,
      "TTH-014",
      48,
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800",
    ],
    [
      "Nồi inox 3 đáy nắp kính 20cm",
      259000,
      7,
      "POT-015",
      18,
      "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800",
    ],
    [
      "Chảo chống dính đá hoa cương 24cm",
      185000,
      7,
      "PAN-016",
      25,
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800",
    ],
    [
      "Táo đỏ Fuji giòn ngọt túi 1kg",
      59000,
      8,
      "APL-017",
      40,
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800",
    ],
    [
      "Chuối tiêu chín vàng nải 1.2kg",
      35000,
      8,
      "BAN-018",
      35,
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800",
    ],
    [
      "Tai nghe không dây Bluetooth TWS",
      399000,
      9,
      "EAR-019",
      15,
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    ],
    [
      "Củ sạc nhanh 20W Type-C Power Delivery",
      189000,
      9,
      "CHG-020",
      28,
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
    ],
  ] as const;

  const products = await Product.create(
    productDefs.map(([name, price, catIndex, sku, stock, image], idx) => ({
      name,
      description: `${name} — hàng bán lẻ chất lượng, phù hợp cửa hàng tiện lợi và siêu thị mini.`,
      price,
      image,
      category: categories[catIndex]._id,
      sku,
      stock,
      isActive: true,
      createdAt: new Date(Date.now() - (productDefs.length - idx) * 3600000),
    })),
  );

  const comments = [
    "Sản phẩm tốt, sẽ mua lại.",
    "Chất lượng ổn so với giá.",
    "Gói hàng đẹp, giao nhanh.",
    "Hơi đắt nhưng dùng được lâu.",
    "Không như kỳ vọng lắm.",
    "Rất hài lòng, nhân viên tư vấn tốt.",
    "Hương vị ổn, đóng gói chắc chắn.",
    "Sẽ giới thiệu cho bạn bè.",
    "Cần cải thiện hạn sử dụng trên kệ.",
    "Đúng mô tả, đáng tiền.",
  ];

  const reviewsPayload = [];
  let reviewCount = 0;
  for (let p = 0; p < products.length && reviewCount < 30; p += 1) {
    for (let c = 0; c < customers.length && reviewCount < 30; c += 1) {
      if ((p + c) % 2 === 0 || reviewCount < 10) {
        reviewsPayload.push({
          product: products[p]._id,
          customer: customers[c]._id,
          rating: 1 + ((p + c * 2) % 5),
          comment: comments[(p + c) % comments.length],
          status: "PUBLISHED" as const,
          createdAt: new Date(Date.now() - (30 - reviewCount) * 86400000),
        });
        reviewCount += 1;
      }
    }
  }

  const reviews = await Review.insertMany(reviewsPayload);

  const replyTargets = reviews.slice(0, 12);
  await Reply.insertMany(
    replyTargets.map((review, i) => ({
      review: review._id,
      staff: staff._id,
      content:
        i % 2 === 0
          ? "Cảm ơn bạn đã đánh giá. Cửa hàng sẽ tiếp tục cải thiện dịch vụ."
          : "Chúng tôi đã ghi nhận góp ý và phản hồi bộ phận bán hàng.",
    })),
  );

  console.log("Seed completed.");
  console.log("Admin     admin@rfms.local / Admin@123");
  console.log("Staff     staff@rfms.local / Staff@123");
  console.log("Customer  customer1@rfms.local / Customer@123");
  console.log(`Users ${await User.countDocuments()} | Categories ${categories.length} | Products ${products.length} | Reviews ${reviews.length} | Replies ${replyTargets.length}`);
  await disconnectDb();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
