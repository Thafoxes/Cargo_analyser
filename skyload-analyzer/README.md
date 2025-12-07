# ◢◤ SKYLOAD ANALYZER ◥◣

> Advanced cargo weight analysis and optimization for air freight operations

![Cyberpunk Theme](https://img.shields.io/badge/theme-cyberpunk-00fff5)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## 🚀 Features

- **📊 Dashboard** - Real-time cargo weight and volume utilization metrics
- **⚠️ Overweight Detection** - Automatic alerts for flights exceeding weight limits
- **📈 Analytics** - Aircraft and route performance breakdown
- **🎨 Cyberpunk UI** - Stunning neon-themed interface

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Cyberpunk Theme
- **Animations**: Framer Motion
- **Charts**: Recharts (coming soon)
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
skyload-analyzer/
├── src/
│   ├── app/
│   │   ├── globals.css      # Cyberpunk theme styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main dashboard
│   ├── components/
│   │   ├── dashboard/       # Dashboard components
│   │   └── layout/          # Layout components
│   └── lib/
│       ├── types.ts         # TypeScript types
│       ├── utils.ts         # Utility functions
│       ├── csv-parser.ts    # CSV parsing
│       └── analysis.ts      # Weight analysis logic
├── tailwind.config.ts       # Tailwind + cyber theme
└── package.json
```

## 🎮 Usage

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Upload your CSV file with cargo data
4. View dashboard with weight analysis and alerts

## 📊 CSV Format

The application expects CSV files with the following columns:

| Column | Description |
|--------|-------------|
| flight_number | Flight identifier |
| flight_date | Date (YYYY-MM-DD) |
| origin | Origin airport code |
| destination | Destination airport code |
| tail_number | Aircraft registration |
| aircraft_type | Aircraft model |
| gross_weight_cargo_kg | Cargo weight in kg |
| gross_volume_cargo_m3 | Cargo volume in m³ |
| passenger_count | Number of passengers |
| baggage_weight_kg | Baggage weight in kg |
| fuel_weight_kg | Fuel weight in kg |
| fuel_price_per_kg | Fuel price per kg |
| cargo_price_per_kg | Cargo price per kg |

## 🎨 Cyberpunk Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Neon Cyan | `#00fff5` | Primary accent |
| Neon Magenta | `#ff00ff` | Secondary accent |
| Neon Green | `#39ff14` | Success states |
| Neon Red | `#ff073a` | Danger/alerts |
| Neon Yellow | `#ffd700` | Warnings |

## 📄 License

MIT License

