# Menggunakan image Node.js LTS sebagai image dasar
FROM node:lts

# Set directory kerja di dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Menginstal dependensi
RUN npm install

# Menyalin seluruh isi folder kerja (kode aplikasi) ke dalam container
COPY . .

# Membuka port yang digunakan oleh aplikasi (misal 3000)
EXPOSE 3000

# Menjalankan aplikasi
CMD ["npm", "start"]
