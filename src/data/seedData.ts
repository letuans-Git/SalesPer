import { Product, SalesRep, Region, Channel, Settings } from '../types';

export const INITIAL_SETTINGS: Settings = {
  Company_Name: 'CHINFON CEMENT Corp.',
  Dashboard_Title: 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION',
  Currency: 'VND',
  Current_Year: 2026,
  Comparison_Year: 2025,
  Start_Month: 1,
  End_Month: 9,
  Last_Data_Refresh: new Date().toISOString(),
  Demo_Data_Version: 'v2.4.0-DEMO',
  Data_Generation_Seed: 20261105,
};

export const SEED_REGIONS: Region[] = [
  { Region_ID: 'REG_MB', Region_Name: 'Miền Bắc', Region_Manager: 'Nguyễn Đức Thành', Status: 'Active' },
  { Region_ID: 'REG_MT', Region_Name: 'Miền Trung', Region_Manager: 'Trần Văn Hải', Status: 'Active' },
  { Region_ID: 'REG_MN', Region_Name: 'Miền Nam', Region_Manager: 'Lê Quốc Dũng', Status: 'Active' },
  { Region_ID: 'REG_TN', Region_Name: 'Tây Nguyên', Region_Manager: 'Hoàng Minh Tuấn', Status: 'Active' },
  { Region_ID: 'REG_DBSCL', Region_Name: 'Đồng bằng sông Cửu Long', Region_Manager: 'Võ Thị Ánh Tuyết', Status: 'Active' },
];

export const SEED_CHANNELS: Channel[] = [
  { Channel_ID: 'CHN_DIRECT', Channel_Name: 'Direct Sales', Description: 'Bán hàng trực tiếp dự án trọng điểm, nhà thầu EPC cấp 1', Status: 'Active' },
  { Channel_ID: 'CHN_DIST', Channel_Name: 'Distributor', Description: 'Hệ thống Nhà phân phối độc quyền và Tổng đại lý vùng', Status: 'Active' },
  { Channel_ID: 'CHN_ONLINE', Channel_Name: 'Online', Description: 'Cổng B2B Portal điện tử và điều vận trực tuyến', Status: 'Active' },
  { Channel_ID: 'CHN_KA', Channel_Name: 'Key Account', Description: 'Khách hàng chiến lược: Trạm trộn bê tông, Cảng, Nhà máy cấu kiện', Status: 'Active' },
  { Channel_ID: 'CHN_RETAIL', Channel_Name: 'Retail', Description: 'Mạng lưới cửa hàng vật liệu xây dựng bán lẻ dân dụng', Status: 'Active' },
];

export const SEED_PRODUCTS: Product[] = [
  // 1. Xi măng bao (5 products)
  { Product_ID: 'PRD_BAO_PCB30', Product_Name: 'Xi măng Chinfon PCB30 Bao 50kg', Category: 'Xi măng bao', Unit: 'Tấn', Standard_Price: 1650000, Standard_Cost: 1220000, Status: 'Active' },
  { Product_ID: 'PRD_BAO_PCB40', Product_Name: 'Xi măng Chinfon PCB40 Bao 50kg', Category: 'Xi măng bao', Unit: 'Tấn', Standard_Price: 1850000, Standard_Cost: 1350000, Status: 'Active' },
  { Product_ID: 'PRD_BAO_PC50', Product_Name: 'Xi măng Pooc lăng PC50 Bao 50kg', Category: 'Xi măng bao', Unit: 'Tấn', Standard_Price: 2100000, Standard_Cost: 1530000, Status: 'Active' },
  { Product_ID: 'PRD_BAO_MC25', Product_Name: 'Xi măng xây tô MC25 Chinfon Bao', Category: 'Xi măng bao', Unit: 'Tấn', Standard_Price: 1450000, Standard_Cost: 1080000, Status: 'Active' },
  { Product_ID: 'PRD_BAO_PREM', Product_Name: 'Xi măng Đa dụng Premium Cao cấp Bao', Category: 'Xi măng bao', Unit: 'Tấn', Standard_Price: 1980000, Standard_Cost: 1410000, Status: 'Active' },

  // 2. Xi măng rời / xá (5 products)
  { Product_ID: 'PRD_ROI_PCB40', Product_Name: 'Xi măng rời PCB40 Bơm bồn', Category: 'Xi măng rời', Unit: 'Tấn', Standard_Price: 1680000, Standard_Cost: 1280000, Status: 'Active' },
  { Product_ID: 'PRD_ROI_PC50', Product_Name: 'Xi măng rời PC50 Công nghiệp trạm trộn', Category: 'Xi măng rời', Unit: 'Tấn', Standard_Price: 1920000, Standard_Cost: 1440000, Status: 'Active' },
  { Product_ID: 'PRD_ROI_LH', Product_Name: 'Xi măng xá tỏa nhiệt thấp Low Heat', Category: 'Xi măng rời', Unit: 'Tấn', Standard_Price: 2250000, Standard_Cost: 1620000, Status: 'Active' },
  { Product_ID: 'PRD_ROI_HYD', Product_Name: 'Xi măng rời đập Thủy điện & Thủy lợi', Category: 'Xi măng rời', Unit: 'Tấn', Standard_Price: 2050000, Standard_Cost: 1500000, Status: 'Active' },
  { Product_ID: 'PRD_ROI_SLG', Product_Name: 'Xi măng xá xỉ lò cao BFS Granulated', Category: 'Xi măng rời', Unit: 'Tấn', Standard_Price: 1750000, Standard_Cost: 1300000, Status: 'Active' },

  // 3. Clinker thương phẩm (4 products)
  { Product_ID: 'PRD_CLK_C150', Product_Name: 'Clinker Portland C150 Thương phẩm', Category: 'Clinker', Unit: 'Tấn', Standard_Price: 850000, Standard_Cost: 650000, Status: 'Active' },
  { Product_ID: 'PRD_CLK_EXP', Product_Name: 'Clinker CPC50 Xuất khẩu Tiêu chuẩn', Category: 'Clinker', Unit: 'Tấn', Standard_Price: 980000, Standard_Cost: 730000, Status: 'Active' },
  { Product_ID: 'PRD_CLK_LOW', Product_Name: 'Clinker Kiềm thấp Low Alkali', Category: 'Clinker', Unit: 'Tấn', Standard_Price: 1050000, Standard_Cost: 790000, Status: 'Active' },
  { Product_ID: 'PRD_CLK_SR', Product_Name: 'Clinker Bền Sunfat Chống ăn mòn', Category: 'Clinker', Unit: 'Tấn', Standard_Price: 1120000, Standard_Cost: 830000, Status: 'Active' },

  // 4. Xi măng đặc chủng (6 products)
  { Product_ID: 'PRD_SPE_SR5', Product_Name: 'Xi măng bền sunfat Type V Công trình biển', Category: 'Xi măng đặc chủng', Unit: 'Tấn', Standard_Price: 2450000, Standard_Cost: 1750000, Status: 'Active' },
  { Product_ID: 'PRD_SPE_RAPID', Product_Name: 'Xi măng đông kết nhanh Rapid Hardening', Category: 'Xi măng đặc chủng', Unit: 'Tấn', Standard_Price: 2850000, Standard_Cost: 1980000, Status: 'Active' },
  { Product_ID: 'PRD_SPE_WELL', Product_Name: 'Xi măng Giếng khoan Dầu khí Class G', Category: 'Xi măng đặc chủng', Unit: 'Tấn', Standard_Price: 3800000, Standard_Cost: 2600000, Status: 'Active' },
  { Product_ID: 'PRD_SPE_PC70', Product_Name: 'Xi măng Pooc lăng mác siêu cao PC70', Category: 'Xi măng đặc chủng', Unit: 'Tấn', Standard_Price: 3200000, Standard_Cost: 2250000, Status: 'Active' },
  { Product_ID: 'PRD_SPE_WHITE', Product_Name: 'Xi măng Trắng kiến trúc mỹ thuật Chinfon', Category: 'Xi măng đặc chủng', Unit: 'Tấn', Standard_Price: 2600000, Standard_Cost: 1820000, Status: 'Active' },
  { Product_ID: 'PRD_SPE_SEAL', Product_Name: 'Xi măng Polyme Chống thấm Tinh chất', Category: 'Xi măng đặc chủng', Unit: 'Tấn', Standard_Price: 3450000, Standard_Cost: 2400000, Status: 'Active' },

  // 5. Đóng bao Jumbo / Big Bag (4 products)
  { Product_ID: 'PRD_JUM_PCB40', Product_Name: 'Xi măng PCB40 Bao Jumbo 1.5 Tấn', Category: 'Xi măng Jumbo', Unit: 'Tấn', Standard_Price: 1780000, Standard_Cost: 1310000, Status: 'Active' },
  { Product_ID: 'PRD_JUM_PC50', Product_Name: 'Xi măng PC50 Bao Jumbo 2.0 Tấn', Category: 'Xi măng Jumbo', Unit: 'Tấn', Standard_Price: 2020000, Standard_Cost: 1470000, Status: 'Active' },
  { Product_ID: 'PRD_JUM_SLING', Product_Name: 'Xi măng Đóng bao Sling Cẩu hàng biển', Category: 'Xi măng Jumbo', Unit: 'Tấn', Standard_Price: 1880000, Standard_Cost: 1390000, Status: 'Active' },
  { Product_ID: 'PRD_JUM_ECO', Product_Name: 'Xi măng Xanh Tro Bay Eco-Cement Jumbo', Category: 'Xi măng Jumbo', Unit: 'Tấn', Standard_Price: 1720000, Standard_Cost: 1250000, Status: 'Active' },
];

export const SEED_SALES_REPS: SalesRep[] = [
  // Miền Bắc (6 reps)
  { Sales_Rep_ID: 'REP_MB_01', Sales_Rep_Name: 'Phạm Quang Minh', Department: 'Kinh doanh Dự án', Region_ID: 'REG_MB', Join_Date: '2020-03-15', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MB_02', Sales_Rep_Name: 'Nguyễn Thu Trang', Department: 'Phân phối Đại lý', Region_ID: 'REG_MB', Join_Date: '2021-06-01', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MB_03', Sales_Rep_Name: 'Đặng Tuấn Anh', Department: 'Kinh doanh Dự án', Region_ID: 'REG_MB', Join_Date: '2019-11-20', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MB_04', Sales_Rep_Name: 'Bùi Thị Bích Ngọc', Department: 'Thương mại Điện tử & B2B', Region_ID: 'REG_MB', Join_Date: '2022-04-10', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MB_05', Sales_Rep_Name: 'Hoàng Văn Chiến', Department: 'Phân phối Đại lý', Region_ID: 'REG_MB', Join_Date: '2023-01-15', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MB_06', Sales_Rep_Name: 'Vũ Hải Nam', Department: 'Bán lẻ Dân dụng', Region_ID: 'REG_MB', Join_Date: '2022-09-01', Status: 'Active' },

  // Miền Trung (5 reps)
  { Sales_Rep_ID: 'REP_MT_01', Sales_Rep_Name: 'Lê Hoàng Long', Department: 'Kinh doanh Dự án', Region_ID: 'REG_MT', Join_Date: '2020-08-12', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MT_02', Sales_Rep_Name: 'Hồ Thị Mai Lan', Department: 'Phân phối Đại lý', Region_ID: 'REG_MT', Join_Date: '2021-02-18', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MT_03', Sales_Rep_Name: 'Trịnh Quốc Bảo', Department: 'Kinh doanh Trạm trộn', Region_ID: 'REG_MT', Join_Date: '2022-07-05', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MT_04', Sales_Rep_Name: 'Đinh Công Trình', Department: 'Bán lẻ Dân dụng', Region_ID: 'REG_MT', Join_Date: '2023-03-20', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MT_05', Sales_Rep_Name: 'Phan Nhật Huy', Department: 'Kinh doanh Dự án', Region_ID: 'REG_MT', Join_Date: '2021-10-15', Status: 'Active' },

  // Miền Nam (6 reps)
  { Sales_Rep_ID: 'REP_MN_01', Sales_Rep_Name: 'Trần Đại Nghĩa', Department: 'Key Account Cảng & Trạm', Region_ID: 'REG_MN', Join_Date: '2019-05-10', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MN_02', Sales_Rep_Name: 'Ngô Thanh Trúc', Department: 'Phân phối Đại lý', Region_ID: 'REG_MN', Join_Date: '2020-11-01', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MN_03', Sales_Rep_Name: 'Võ Minh Khang', Department: 'Kinh doanh Dự án', Region_ID: 'REG_MN', Join_Date: '2021-04-25', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MN_04', Sales_Rep_Name: 'Lý Quốc Đạt', Department: 'Key Account Công nghiệp', Region_ID: 'REG_MN', Join_Date: '2022-01-12', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MN_05', Sales_Rep_Name: 'Dương Thị Cẩm Tú', Department: 'Thương mại Điện tử B2B', Region_ID: 'REG_MN', Join_Date: '2022-08-14', Status: 'Active' },
  { Sales_Rep_ID: 'REP_MN_06', Sales_Rep_Name: 'Phùng Đình Tuấn', Department: 'Bán lẻ Dân dụng', Region_ID: 'REG_MN', Join_Date: '2023-05-02', Status: 'Active' },

  // Tây Nguyên (4 reps)
  { Sales_Rep_ID: 'REP_TN_01', Sales_Rep_Name: 'Y Krăk Niê', Department: 'Kinh doanh Dự án Thủy điện', Region_ID: 'REG_TN', Join_Date: '2020-07-20', Status: 'Active' },
  { Sales_Rep_ID: 'REP_TN_02', Sales_Rep_Name: 'Đào Duy Mạnh', Department: 'Phân phối Đại lý', Region_ID: 'REG_TN', Join_Date: '2021-09-08', Status: 'Active' },
  { Sales_Rep_ID: 'REP_TN_03', Sales_Rep_Name: 'Lâm Khánh Chi', Department: 'Bán lẻ Dân dụng', Region_ID: 'REG_TN', Join_Date: '2022-12-01', Status: 'Active' },
  { Sales_Rep_ID: 'REP_TN_04', Sales_Rep_Name: 'Cao Bá Thắng', Department: 'Kinh doanh Dự án', Region_ID: 'REG_TN', Join_Date: '2023-04-18', Status: 'Active' },

  // Đồng bằng sông Cửu Long (4 reps)
  { Sales_Rep_ID: 'REP_DBSCL_01', Sales_Rep_Name: 'Huỳnh Tấn Phát', Department: 'Kinh doanh Công trình Biển', Region_ID: 'REG_DBSCL', Join_Date: '2019-12-01', Status: 'Active' },
  { Sales_Rep_ID: 'REP_DBSCL_02', Sales_Rep_Name: 'Thái Mỹ Dung', Department: 'Phân phối Đại lý', Region_ID: 'REG_DBSCL', Join_Date: '2021-05-15', Status: 'Active' },
  { Sales_Rep_ID: 'REP_DBSCL_03', Sales_Rep_Name: 'Quách Ngọc Sơn', Department: 'Key Account Cầu Cảng', Region_ID: 'REG_DBSCL', Join_Date: '2022-03-30', Status: 'Active' },
  { Sales_Rep_ID: 'REP_DBSCL_04', Sales_Rep_Name: 'Lê Thị Thu Thảo', Department: 'Bán lẻ Vật liệu', Region_ID: 'REG_DBSCL', Join_Date: '2023-02-10', Status: 'Active' },
];

export const DEMO_CUSTOMERS = [
  'Tổng Công ty Xây dựng Trường Sơn',
  'Tập đoàn Xây dựng Delta',
  'Công ty CP Fecon Việt Nam',
  'Công ty Bê tông Hùng Vương',
  'Công ty Bê tông Vinaconex',
  'Tổng Công ty 319 Bộ Quốc Phòng',
  'Công ty CP Bê tông Rạch Chiếc',
  'Tập đoàn Đèo Cả',
  'Công ty Xây dựng Hòa Bình',
  'Công ty Bê tông Transmeco',
  'Công ty CP Đầu tư Nam Long',
  'Tổng Công ty Thăng Long',
  'Tập đoàn CIENCO 4',
  'Công ty CP Lilama 10',
  'Công ty Bê tông Becamex Bình Dương',
  'Công ty Xây dựng Phục Hưng Holdings',
  'Công ty CP Bê tông Phan Vũ',
  'Đại lý Xi măng Hoàng Phát Hải Phòng',
  'Tổng Đại lý Vật liệu Trung Nam Đà Nẵng',
  'Công ty CP VLXD Miền Tây Cần Thơ',
  'Nhà phân phối An Bình Tây Nguyên',
  'Đại lý phân phối xi măng Thắng Lợi Sài Gòn',
  'Công ty Bê tông Châu Thới 620',
  'Tập đoàn Sun Group (BQL Dự án)',
  'Công ty CP Xây dựng Coteccons',
  'Ban QLDA Cầu Mỹ Thuận 2',
  'Ban Quản lý Dự án Đường sắt Đô thị',
  'Công ty CP Bê tông AMACCAO',
  'Công ty VLXD Phúc Thịnh Quảng Ninh',
  'Trạm trộn bê tông Vạn Tường Quảng Ngãi',
];
