# ✈️ SkyLoad Analyzer

> **AI-Powered Cargo Space Optimization for Airlines**

A cyberpunk-themed web application for analyzing and optimizing air cargo placement using 3D visualization and AI recommendations.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-React_Three_Fiber-black?logo=three.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

---

## 🎯 Overview

SkyLoad Analyzer helps airline cargo operations teams:
- **Detect overweight flights** from CSV cargo manifests
- **Visualize cargo placement** in interactive 3D aircraft models
- **Optimize load distribution** for balance and safety
- **Calculate profitability** (cargo revenue vs fuel costs)
- **Generate AI recommendations** for cargo arrangement

---

## ✨ Features

### 📊 Dashboard
- Upload and analyze CSV cargo data
- View flight statistics and utilization metrics
- Filter by weight/volume status (safe, warning, danger)
- Sort flights by utilization to find problematic loads

### 🧊 3D Cargo Optimizer
- Interactive 3D wireframe aircraft model
- Visual container placement in cargo hold
- Multiple container types (LD3, LD6, LD11, Pallets, Bulk)
- Real-time weight distribution visualization
- Click containers for details

### 💰 Financial Analysis
- Fuel cost calculation
- Cargo revenue estimation
- Profit/loss per flight
- Break-even cargo weight calculation
- Optimization alerts for unprofitable flights

### 🤖 AI Integration
- Claude API integration for intelligent placement suggestions
- Automatic container distribution across cargo sections
- Balance score calculation (CG optimization)
- Overflow detection and warnings

### 📋 Flight Load Summary
- Passenger count and weight
- Baggage weight from manifest
- Fuel weight and pricing
- Available cargo capacity (MTOW consideration)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **React Three Fiber** | 3D visualization |
| **Three.js** | WebGL rendering |
| **Tailwind CSS** | Styling with cyberpunk theme |
| **Framer Motion** | Animations |
| **Anthropic Claude API** | AI-powered recommendations |
| **Papa Parse** | CSV parsing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Anthropic API key (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cargo_space_analyser.git
cd cargo_space_analyser/skyload-analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

> **Note:** The app works without an API key using fallback placement algorithms.

---

## 📖 Usage

### 1. Upload Cargo Data
Navigate to the **Dashboard** and upload your CSV file with flight cargo data.

**Required CSV columns:**
```
flight_number, flight_date, origin, destination, tail_number, 
aircraft_type, gross_weight_cargo_kg, gross_volume_cargo_m3,
passenger_count, baggage_weight_kg, fuel_weight_kg, 
fuel_price_per_kg, cargo_price_per_kg
```

### 2. Analyze Flights
- View all flights with weight/volume utilization
- Sort by utilization to find overloaded flights
- Filter by status (safe, warning, overweight)

### 3. Optimize Cargo
- Click **[3D]** button on any flight row
- Auto-loads flight data with containers generated from CSV
- View 3D cargo hold visualization
- Check financial summary (profit/loss)
- Click **OPTIMIZE PLACEMENT** for AI-powered arrangement

### 4. Review Results
- See container positions in 3D
- Check balance score (CG distribution)
- Review AI recommendations
- Export loading plan as JSON

---

## 📁 Project Structure

```
skyload-analyzer/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── optimizer/
│   │   │   └── page.tsx          # 3D Optimizer
│   │   └── api/
│   │       ├── ai-analyze/       # AI analysis endpoint
│   │       └── ai-place/         # Container placement API
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── FlightTable.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── AlertsPanel.tsx
│   │   ├── optimizer/
│   │   │   ├── FlightSelector.tsx
│   │   │   ├── ContainerSelector.tsx
│   │   │   ├── FlightLoadSummary.tsx
│   │   │   └── RecommendationsPanel.tsx
│   │   └── visualization/
│   │       ├── Scene3D.tsx
│   │       ├── AircraftWireframe.tsx
│   │       └── CargoContainer3D.tsx
│   └── lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── cargo-types.ts        # Cargo specifications
│       ├── aircraft-models.ts    # 3D aircraft definitions
│       ├── analysis.ts           # Weight analysis functions
│       └── utils.ts              # Helper functions
├── public/
│   └── fonts/                    # Cyberpunk fonts
└── package.json
```

---

## ✈️ Supported Aircraft

| Aircraft | Max Cargo Weight | Cargo Sections |
|----------|-----------------|----------------|
| Boeing 737-800 | 2,000 kg | FWD, AFT |
| Boeing 737-900ER | 2,500 kg | FWD, AFT |
| Airbus A330-200 | 15,000 kg | FWD, MID, AFT |
| Airbus A330-300 | 18,000 kg | FWD, MID, AFT |

---

## 📦 Container Types

| Type | Max Weight | Volume | Color |
|------|-----------|--------|-------|
| LD3 Container | 1,588 kg | 4.5 m³ | 🟦 Cyan |
| LD6 Container | 3,175 kg | 8.9 m³ | 🟪 Magenta |
| LD11 Container | 3,176 kg | 7.0 m³ | 🟩 Green |
| Standard Pallet | 4,626 kg | 10.0 m³ | 🟨 Gold |
| Bulk Cargo | 1,000 kg | 3.0 m³ | 🟧 Orange |

---

## 🎨 Design

The application features a **cyberpunk aesthetic** with:
- Dark background with cyan/magenta accents
- Glowing neon effects
- Wireframe 3D graphics
- Orbitron display font
- Animated transitions

---

## 🔮 Phase 2 Roadmap

- [ ] Real-time collaboration
- [ ] Multiple aircraft comparison
- [ ] Route optimization
- [ ] Weather impact analysis
- [ ] Integration with airline booking systems
- [ ] Mobile responsive 3D view
- [ ] Export to airline load sheet formats
- [ ] Historical trend analysis

---

## 📄 Sample Data

A sample CSV file is included: `251205_cursor hackathon data - sample_2023.csv`

Contains 1,600+ flight records with:
- Multiple aircraft types
- Various routes (KUL, SIN, BKK, HKG, PVG, SGN)
- Realistic cargo weights and pricing

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project was created for the **Cursor Hackathon 2024**.

MIT License - feel free to use and modify!

---

## 🙏 Acknowledgments

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for 3D rendering
- [Anthropic Claude](https://www.anthropic.com/) for AI capabilities
- [Vercel](https://vercel.com/) for Next.js framework
- Cyberpunk aesthetic inspiration from various sources

---

<div align="center">

**Built with ❤️ for the Cursor Hackathon**

[View Demo](http://localhost:3000) · [Report Bug](https://github.com/yourusername/cargo_space_analyser/issues) · [Request Feature](https://github.com/yourusername/cargo_space_analyser/issues)

</div>

