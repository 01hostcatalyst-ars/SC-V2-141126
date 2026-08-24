# Influencer Rate & Pricing Calculator: Mathematical Formulas & 12 Scenario Validations

This document presents the complete mathematical architecture, step-by-step formulas, and **12 detailed real-world execution scenarios** from the active 16-knot 9-step valuation engine in `src/lib/calculator/engine.ts`.

---

## 1. The Core 9-Step Valuation Pipeline

```
Follower / Subscriber Count (F)
       │
       ▼ [Step 1: 16-Knot Continuous Linear Interpolation]
Base Deliverable USD (R_base) & Target Benchmark ER
       │
       ▼ [Step 2 & 3: Platform Performance & Sourced Niche Tuning]
[Performance Multiplier (0.70x - 1.40x)] × [Niche Index (0.45x - 2.67x)]
       │
       ▼ [Step 4: Damped Anti-Runaway Cap Enforcement]
Effective Deliverable Fee (Capped at 2.25x Base)
       │
       ▼ [Step 5: Multi-Asset Bundle Volume Discount: 0% - 15%]
Net Content Fee USD
       │
       ▼ [Step 6 & 7: Additive Commercial Terms & Production Addons]
+ [Usage Rights %] + [Exclusivity %] + [Whitelisting %] + [Turnaround/Addons]
       │
       ▼ [Step 8: Global GDP PPP & FX Currency Calibration]
Localized Median Valuation
       │
       ▼ [Step 9: Defended Negotiation Bounds Output]
[Budget Offer (0.80x) | Typical Median (1.00x) | Premium Ask (1.25x)]
```

---

## 2. Step-by-Step Mathematical Formulas

### **Step 1: 16-Knot Piecewise Linear Base Interpolation**
Given a creator's follower count $F$, the engine finds adjacent market knots $(F_k, P_k)$ and $(F_{k+1}, P_{k+1})$:

$$R_{\text{base}}(F) = P_k + \left( \frac{F - F_k}{F_{k+1} - F_k} \right) \cdot (P_{k+1} - P_k)$$
$$\text{ER}_{\text{target}}(F) = \text{ER}_k + \left( \frac{F - F_k}{F_{k+1} - F_k} \right) \cdot (\text{ER}_{k+1} - \text{ER}_k)$$

---

### **Step 2: Platform-Specific Performance Multipliers ($M_{\text{perf}}$)**

$$M_{\text{perf}} = \text{clamp}\big(1.0 + \text{ER Log Factor} + \text{View Log Factor},\; 0.70,\; 1.40\big)$$

* **Instagram:** $\text{ER} = \left( \frac{\text{Likes} + \text{Comments}}{\text{Followers}} \right) \times 100\%$, $\text{ER Log Factor} = 0.15 \cdot \log_2 \left( \frac{\text{Observed ER}}{\text{ER}_{\text{target}}(F)} \right)$
* **TikTok:** $\text{ER} = \left( \frac{\text{Likes} + \text{Comments} + \text{Shares}}{\text{Views}} \right) \times 100\%$, includes View Velocity Factor.
* **YouTube Track A (Long-Form):** Evaluated against long-form viewership and production floor.
* **YouTube Track B (Shorts):** Evaluated against vertical Shorts velocity and $4.50\%$ baseline.

---

### **Step 3 & 4: Sourced Niche Index ($I_{\text{niche}}$) & Damped Cap**
* Sourced against Aspire's verified $$562$ Lifestyle baseline ($2.67\times$ down to $0.45\times$).
* Damped Fee: $\text{Deliverable Fee} = \min\big(R_{\text{base}} \times I_{\text{niche}} \times M_{\text{perf}},\; R_{\text{base}} \times 2.25\big)$.

---

### **Step 5, 6 & 7: Bundle Volume Discounts, Rights & Addons**
* **Bundle Discount:** 1 asset ($0\%$), 2–3 assets ($10\%$), 4+ assets ($15\%$).
* **Commercial Rights:** Additive on net content fee (Paid Ads, Whitelisting, Exclusivity).
* **Production Addons:** Rush turnaround, raw footage buyout, extra revisions.

---

### **Step 8 & 9: 20-Country GDP PPP Matrix & Negotiation Bounds**

$$\text{Localized Target Median} = \text{Total Global USD} \times \text{PPP Index}_{\text{Country}} \times \text{FX Rate}_{\text{Country}}$$

* **Budget Offer (Negotiation Floor):** $\text{Localized Median} \times 0.80$
* **Typical Valuation (Defended Median):** $\mathbf{\text{Localized Median} \times 1.00}$
* **Premium Ask (Agency / High-Demand Ask):** $\text{Localized Median} \times 1.25$

---

## 3. Real-World Execution Results (12 Scenarios from Live Engine)


### **Scenario 1: Nano Instagram Lifestyle Creator (Single Reel)**

* **Context:** A growing lifestyle creator in the US with 3,000 followers posting 1 standard Instagram Reel with organic usage.
* **Inputs:**
  * Platform: **INSTAGRAM**
  * Followers / Subscribers: **3,000**
  * Observed ER: **4.33%** (vs **3.8%** Target Benchmark)
  * Sourced Niche Multiplier: **1x** (Lifestyle & Daily Vlogs)
  * Performance Multiplier: **1.03x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $270 | $278 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $278
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $278
* **Total Global Valuation (USD):** **$278**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$222** | **$278** | **$347** |

---

### **Scenario 2: Micro YouTube Tech Reviewer (Integration + Short Bundle)**

* **Context:** An 18,000 subscriber YouTube tech channel providing a 60s sponsored integration plus 1 YouTube Short.
* **Inputs:**
  * Platform: **YOUTUBE**
  * Followers / Subscribers: **18,000**
  * Observed ER: **12.02%** (vs **3.21%** Target Benchmark)
  * View Velocity: **6,200 avg views**
  * Sourced Niche Multiplier: **1.35x** (Technology, Hardware & AI)
  * Performance Multiplier: **1.34x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_integrated` | youtube | 1 | $400 | $725 |
| `yt_short` | youtube | 1 | $240 | $435 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $1,161
* **Volume Bundle Discount:** 10% (-$116)
* **Net Content Fee:** $1,045
* **Total Global Valuation (USD):** **$1,045**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$836** | **$1,045** | **$1,306** |

---

### **Scenario 3: Mid-Tier TikTok Gaming Creator (1x Video + 30-Day Paid Ads)**

* **Context:** A 120,000 follower TikTok gaming creator with strong viral reach, offering 1 dedicated video with 30-day paid ads usage rights.
* **Inputs:**
  * Platform: **TIKTOK**
  * Followers / Subscribers: **120,000**
  * Observed ER: **15.62%** (vs **3.92%** Target Benchmark)
  * View Velocity: **65,000 avg views**
  * Sourced Niche Multiplier: **1.35x** (Technology, Hardware & AI)
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 1 | $1,390 | $2,627 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $2,627
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $2,627
* **Commercial Rights & Exclusivity:** +$657
* **Total Global Valuation (USD):** **$3,284**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$2,627** | **$3,284** | **$4,105** |

---

### **Scenario 4: Macro Instagram Fashion Creator (Multi-Asset Package + Whitelisting & Exclusivity)**

* **Context:** A 450,000 follower fashion creator delivering a high-volume bundle (2 Reels, 1 Carousel, 1 Story set) with 60-day whitelisting and 14-day competitor exclusivity.
* **Inputs:**
  * Platform: **INSTAGRAM**
  * Followers / Subscribers: **450,000**
  * Observed ER: **1.89%** (vs **0.46%** Target Benchmark)
  * Sourced Niche Multiplier: **0.53x** (Fashion & Apparel)
  * Performance Multiplier: **1.31x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 2 | $5,600 | $7,763 |
| `ig_carousel` | instagram | 1 | $3,580 | $2,481 |
| `ig_story` | instagram | 1 | $1,400 | $970 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $11,215
* **Volume Bundle Discount:** 15% (-$1,682)
* **Net Content Fee:** $9,533
* **Commercial Rights & Exclusivity:** +$5,243
* **Total Global Valuation (USD):** **$14,776**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$11,821** | **$14,776** | **$18,470** |

---

### **Scenario 5: High-Ticket Finance YouTube Channel (Dedicated Video + Rush 48h + Raw Footage)**

* **Context:** An 85,000 subscriber personal finance YouTube authority delivering 1 full dedicated review with 48h rush turnaround and raw B-roll buyout.
* **Inputs:**
  * Platform: **YOUTUBE**
  * Followers / Subscribers: **85,000**
  * Observed ER: **10.06%** (vs **2.48%** Target Benchmark)
  * View Velocity: **32,000 avg views**
  * Sourced Niche Multiplier: **1.8x** (Business, Finance & B2B SaaS)
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_dedicated` | youtube | 1 | $1,938 | $4,361 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $4,361
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $4,361
* **Production Addons & Surcharges:** +$2,834
* **Total Global Valuation (USD):** **$7,195**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$5,756** | **$7,195** | **$8,994** |

---

### **Scenario 6: Beauty TikTok Creator (Saturated Niche with Low Engagement Penalty)**

* **Context:** A 50,000 follower beauty influencer experiencing below-benchmark engagement (clamped to 0.70x performance floor).
* **Inputs:**
  * Platform: **TIKTOK**
  * Followers / Subscribers: **50,000**
  * Observed ER: **7.17%** (vs **4.4%** Target Benchmark)
  * View Velocity: **3,000 avg views**
  * Sourced Niche Multiplier: **0.45x** (Beauty & Cosmetics)
  * Performance Multiplier: **0.89x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 1 | $725 | $291 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $291
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $291
* **Total Global Valuation (USD):** **$291**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$232** | **$291** | **$363** |

---

### **Scenario 7: Luxury Home Design Architect (High Multiplier with Damped Cap Enforcement)**

* **Context:** A 150,000 follower luxury interior architect (2.80x sub-niche + 1.25x luxury flag = 3.50x, damped at 2.25x safety cap).
* **Inputs:**
  * Platform: **INSTAGRAM**
  * Followers / Subscribers: **150,000**
  * Observed ER: **5.25%** (vs **0.5%** Target Benchmark)
  * Sourced Niche Multiplier: **3.5x** (Home Design & Decor)
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $2,900 | $6,525 |
| `ig_carousel` | instagram | 1 | $1,850 | $4,163 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $10,688
* **Volume Bundle Discount:** 10% (-$1,069)
* **Net Content Fee:** $9,619
* **Total Global Valuation (USD):** **$9,619**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$7,695** | **$9,619** | **$12,023** |

---

### **Scenario 8: Viral Pet Care Account (High Engagement & View Velocity Ceiling)**

* **Context:** An 80,000 follower dog training channel on TikTok with viral view velocity (120k avg views), reaching the maximum 1.40x performance ceiling.
* **Inputs:**
  * Platform: **TIKTOK**
  * Followers / Subscribers: **80,000**
  * Observed ER: **8.42%** (vs **4.15%** Target Benchmark)
  * View Velocity: **120,000 avg views**
  * Sourced Niche Multiplier: **1.78x** (Pet Care & Animals)
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 1 | $1,075 | $2,419 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $2,419
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $2,419
* **Total Global Valuation (USD):** **$2,419**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$1,935** | **$2,419** | **$3,023** |

---

### **Scenario 9: Regional UK Fitness Creator (GBP Currency & PPP Calibration)**

* **Context:** A 40,000 follower fitness creator in London, UK producing 1 Reel calibrated for UK purchasing power parity and GBP (£).
* **Inputs:**
  * Platform: **INSTAGRAM**
  * Followers / Subscribers: **40,000**
  * Observed ER: **2.95%** (vs **0.85%** Target Benchmark)
  * Sourced Niche Multiplier: **0.8x** (Health, Wellness & Fitness)
  * Performance Multiplier: **1.27x**
  * Region: **GB (GBP)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $1,200 | $1,219 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $1,219
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $1,219
* **Total Global Valuation (USD):** **$1,219**

#### Final 3-Tier Negotiation Bounds (GBP):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **£655** | **£818** | **£1,023** |

---

### **Scenario 10: Regional India Tech Creator (INR Currency & PPP Calibration)**

* **Context:** A 200,000 subscriber Indian tech YouTuber providing a 60s integration calibrated for Indian market economics in INR (₹).
* **Inputs:**
  * Platform: **YOUTUBE**
  * Followers / Subscribers: **200,000**
  * Observed ER: **13%** (vs **2.1%** Target Benchmark)
  * View Velocity: **50,000 avg views**
  * Sourced Niche Multiplier: **1.35x** (Technology, Hardware & AI)
  * Performance Multiplier: **1.4x**
  * Region: **IN (INR)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_integrated` | youtube | 1 | $4,700 | $8,883 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $8,883
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $8,883
* **Total Global Valuation (USD):** **$8,883**

#### Final 3-Tier Negotiation Bounds (INR):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **₹142,412** | **₹178,015** | **₹222,519** |

---

### **Scenario 11: Regional Pakistan Lifestyle Vlogger (PKR Currency & PPP Calibration)**

* **Context:** A 90,000 follower Pakistani TikTok creator providing 2 dedicated TikTok videos calibrated in Pakistani Rupees (PKR).
* **Inputs:**
  * Platform: **TIKTOK**
  * Followers / Subscribers: **90,000**
  * Observed ER: **15.4%** (vs **4.08%** Target Benchmark)
  * View Velocity: **25,000 avg views**
  * Sourced Niche Multiplier: **1x** (Lifestyle & Daily Vlogs)
  * Performance Multiplier: **1.4x**
  * Region: **PK (PKR)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 2 | $1,163 | $3,256 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $3,256
* **Volume Bundle Discount:** 10% (-$326)
* **Net Content Fee:** $2,931
* **Total Global Valuation (USD):** **$2,931**

#### Final 3-Tier Negotiation Bounds (PKR):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **Rs. 117,535** | **Rs. 146,919** | **Rs. 183,649** |

---

### **Scenario 12: Mega-Tier 360 Omnichannel Campaign (1.2M+ Followers, YT + IG + TikTok)**

* **Context:** A top-tier 1.2M creator delivering a 3-platform campaign (YT Dedicated Video + IG Reel + TikTok Video) with 12-month full category lockout exclusivity.
* **Inputs:**
  * Platform: **YOUTUBE**
  * Followers / Subscribers: **1,200,000**
  * Observed ER: **13.77%** (vs **1.46%** Target Benchmark)
  * View Velocity: **350,000 avg views**
  * Sourced Niche Multiplier: **1.5x** (Business, Finance & B2B SaaS)
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_dedicated` | youtube | 1 | $13,633 | $28,629 |
| `ig_reel` | instagram | 1 | $10,750 | $22,575 |
| `tiktok_video` | tiktok | 1 | $10,750 | $22,575 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $73,779
* **Volume Bundle Discount:** 10% (-$7,378)
* **Net Content Fee:** $66,401
* **Commercial Rights & Exclusivity:** +$132,803
* **Total Global Valuation (USD):** **$199,204**

#### Final 3-Tier Negotiation Bounds (USD):
| Metric | Low (25th Budget Offer) | Defended Median (Typical) | High (75th Premium Ask) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$159,363** | **$199,204** | **$249,005** |

---
