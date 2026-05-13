# CivFit – Bangun Peradabanmu, Bangun Dirimu

**CivFit** adalah game simulasi peradaban yang menggabungkan produktivitas harian dengan strategi pembangunan kota. Setiap kebiasaan positif yang kamu selesaikan (habit) akan mengubah hidupmu sekaligus membangun kotamu.

---

## 📖 Ikhtisar

Di CivFit, kamu berperan sebagai pemimpin sebuah peradaban yang dimulai dari **Zaman Batu**. Setiap hari kamu menentukan kebiasaan yang ingin dibangun (olahraga, belajar, meditasi, dll). Menyelesaikan kebiasaan akan memberimu:

- **Gold & Silver** – mata uang untuk membangun dan meningkatkan bangunan
- **Experience (EXP)** – menaikkan level pemain
- **Momentum** – meningkatkan semua penghargaan hingga 1,5x
- **Kesehatan Kota** – populasi tumbuh, peradaban maju ke era berikutnya

Seiring waktu, kamu bisa membangun **rumah**, **peternakan**, **rumah sakit**, dan bangunan lain di peta kota. Kelola keseimbangan pangan, kesehatan, kebahagiaan, dan populasi untuk mencapai era tertinggi: **Digital**.

---

## 🎮 Mekanisme Utama

### ✅ 1. Habit System (Kebiasaan)

Ada tiga jenis habit:
- **Daily** (Target 1x per hari) – reward kecil, wajib diselesaikan setiap hari agar momentum dan kesehatan kotamu terjaga.
- **Weekly** (Target 3x per minggu) – reward sedang.
- **Monthly** (Target 10x per bulan) – reward besar.

Setiap habit memiliki:
- `goldReward` – tambahan gold langsung
- `expReward` – pengalaman untuk naik level

**Faktor pengali reward:**
- **Momentum** (0–100): +0,5% per poin → maksimal 1,5x EXP dan gold
- **Overachievement**: jika kamu sudah mencapai target periodik (misal 3x weekly), penyelesaian berikutnya di periode yang sama hanya memberi 0,5x reward.

### 🏙️ 2. Kota & Bangunan

Kota direpresentasikan sebagai **grid 10x10**. Kamu dapat meletakkan bangunan di petak kosong.

| Bangunan | Kategori | Efek |
|----------|----------|------|
| House | Residential | +10 kapasitas hunian |
| Farm | Food | +5 produksi pangan per hari |
| Market | Economic | +10 silver per hari |
| Clinic | Health | +5 kesehatan kota |
| Tavern | Happiness | +5 kebahagiaan |

Setiap bangunan bisa di-**upgrade** (meningkatkan level hingga +20% per level). Upgrade membutuhkan silver.

### 📈 3. Level Pemain

- EXP didapat dari habit (daily 50, weekly 250, monthly 1000) dan event.
- **Naik level** ketika `exp >= maxExp`.  
  `maxExp` awal = 100, setiap naik level bertambah 20% (`maxExp = floor(maxExp * 1.2)`).
- Setiap level memberi sense of progress dan membuka bangunan era baru.

### 🧬 4. Era Peradaban

| Era        | Syarat Populasi | Bangunan yang tersedia |
|------------|----------------|------------------------|
| 🪨 Stone Age | 0              | House, Farm, Well |
| ⚔️ Medieval | 100            | Tavern, Market, Barracks |
| 🏭 Industrial | 500          | Factory, Hospital, Train Station |
| 📱 Modern   | 2000           | Apartment, Shopping Mall, University |
| 💾 Digital  | 8000           | Data Center, Robot Farm, Sky Tower |

- **Kamu harus mencapai target populasi** di akhir hari untuk unlock era berikutnya.
- Populasi bertambah secara otomatis saat `endDay` jika **kesehatan > 60**, **tidak lapar**, dan **masih ada kapasitas hunian**.

### 👥 5. Populasi Kota

**Rumus pertumbuhan per hari:**
```
growth = ceil((freeHousing) * 0.1) + 1
```
Contoh: freeHousing = 50 → growth = 6 orang/hari.

**Populasi berkurang jika:**
- Kesehatan < 20 → 40% penduduk sakit meninggal
- Kesehatan 20–49 → 15%
- Kesehatan < 10 → tambahan 5% dari total populasi meninggal
- Kelaparan atau tunawisma tidak langsung membunuh, tapi meningkatkan jumlah sakit yang nanti bisa mati.

### 💰 6. Sumber Daya

- **Gold** – dari habit, bisa digunakan untuk membeli **skip ticket** (membatalkan penalti sehari penuh).
- **Silver** – pajak harian dari populasi dan bangunan ekonomi. Digunakan untuk membangun & upgrade bangunan.
- **Momentum** – meningkat +2 per habit selesai (maks 100). Menurun jika banyak habit tidak selesai.
- **Skip Ticket** – menghindari penalti HP dan penurunan kota saat tidak menyelesaikan habit.

### 🏁 7. Akhir Hari (End Day)

Setiap kali kamu menekan tombol **Akhiri Hari**, sistem akan:
1. Menghitung habit yang selesai hari ini.
2. Menentukan penalti/bonus HP dan momentum.
3. Memproses pajak, kesehatan kota, kebahagiaan.
4. Menghitung pertumbuhan/kematian populasi.
5. Mengecek event bencana (15% kemungkinan).
6. Memperbarui era jika target populasi tercapai.
7. Mengembalikan laporan harian.

**Penalti jika banyak habit tidak selesai:**
- HP berkurang (maks 25% dari max HP)
- Momentum turun drastis
- Kesehatan & kebahagiaan kota menurun
- Populasi bisa stagnan atau mati

**Bonus jika menyelesaikan >80% habit:**
- +10 HP pemain
- +5 momentum
- +5 kesehatan kota, +10 kebahagiaan
- Pertumbuhan populasi optimal

---

## 🛠️ Tech Stack

- **React Native** (Expo)
- **TypeScript**
- **Zustand** – state management
- **Firebase** – authentication, Firestore, realtime sync
- **Lucide Icons** – ikon bangunan & UI
- **Expo Router** – navigasi file-based

---

## 🚀 Menjalankan Proyek

```bash
# Clone repository
git clone https://github.com/your-username/civfit.git
cd civfit

# Install dependencies
npm install

# Jalankan di iOS/Android/Web
npx expo start
```

Pastikan Anda sudah mengatur Firebase:
- Buat project di Firebase Console.
- Aktifkan Authentication (Email/Password atau Google).
- Buat Firestore database.
- Salin konfigurasi ke `services/firebase/config.ts`.

---

## 🧪 Testing & Debug

- **Logout & Reset Data**: Buka menu profil, tekan "Keluar Sesi". Data tetap tersimpan di Firebase.
- **Debugging out-of-bound buildings**: Buka tab Kota, lihat console. Jika ada warning, jalankan `cleanOutOfBoundBuildings()` dari store.
- **Simulasi cepat**: Gunakan tombol "End Day" berulang untuk melihat perubahan populasi dan era.

---

## 🤝 Kontribusi

Kami terbuka untuk kontribusi! Beberapa area yang bisa dikembangkan:
- Fitur peta yang lebih interaktif (drag, zoom)
- Leaderboard global
- Achievement & badge system
- Lebih banyak bangunan dan era
- Animasi transisi era

Silakan buka *issue* atau kirim *pull request*.

---

## 📄 Lisensi

MIT © CivFit Team

---

**”Bangun peradabanmu, bangun dirimu.”**  
Mulai habit pertamamu hari ini, dan lihat kotamu tumbuh!