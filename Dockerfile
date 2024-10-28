# Sử dụng hình ảnh Node.js phiên bản 22
FROM node:22

# Thiết lập port mà ứng dụng sẽ chạy
EXPOSE 5001

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt phiên bản npm mới nhất
RUN npm install -g npm@latest

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package.json package-lock.json ./

# Cài đặt các phụ thuộc của ứng dụng
RUN npm install --only=production

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Chạy lệnh khi container khởi động
CMD ["npm", "run", "start:prod"]
