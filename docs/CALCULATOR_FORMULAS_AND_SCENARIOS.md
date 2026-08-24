# Influencer Rate & Pricing Calculator: Mathematical Formulas & 12 Scenario Validations

This document presents the complete mathematical architecture, step-by-step formulas, and **12 detailed real-world execution scenarios** from the active valuation engine in `src/lib/calculator/engine.ts`.

---

## 1. The Core Valuation Mathematical Model

The calculator evaluates creator sponsorship pricing through an **8-step econometric pipeline**:

```
Follower Count ──► [Knot Interpolation] ──► Base USD
                       │
                       ▼
                 [Performance Multiplier: 0.70x - 1.40x]
                 × [Niche Multiplier: 0.75x - 2.50x]
                       │
                       ▼
                 [Damped Cap: max 2.25x Base]
                       │
                       ▼
                 [Volume Bundle Discount: 10% - 15%]
                       │
                       ▼
                 + [Usage Rights %] + [Exclusivity %] + [Production Addons]
                       │
                       ▼
                 × [Regional PPP Index] × [FX Exchange Rate]
                       │
                       ▼
             [Market Valuation: P25 Low, Median, P75 High]
```

---

## 2. Step-by-Step Mathematical Formulas

### **Formula 1: Piecewise Linear Base Interpolation**
Given a creator's follower count $F$, the engine finds adjacent market knots $(F_0, P_0)$ and $(F_1, P_1)$ for the deliverable format:

$$\text{Base USD} = P_0 + \left( \frac{F - F_0}{F_1 - F_0} \right) \cdot (P_1 - P_0)$$

### **Formula 2: Logarithmic Performance Multiplier**
$$\text{Observed ER (\%)} = \left( \frac{\text{Avg Likes} + \text{Avg Comments}}{F} \right) \times 100$$
$$\text{ER Log Factor} = 0.15 \cdot \log_2 \left( \frac{\text{Observed ER}}{\text{Benchmark ER}} \right)$$
$$\text{View Log Factor} = 0.15 \cdot \log_2 \left( \frac{\text{Observed Views}}{\text{Expected Views}} \right)$$
$$\text{Performance Multiplier} = \text{clamp}\big(1.0 + \text{ER Log Factor} + \text{View Log Factor},\; 0.70,\; 1.40\big)$$

### **Formula 3: Damped Deliverable Fee Cap**
$$\text{Deliverable Fee} = \min\Big(\text{Base USD} \times M_{\text{niche}} \times \text{Performance Multiplier},\; \text{Base USD} \times 2.25\Big)$$

### **Formula 4: Bundle Volume Discount**
$$\text{Bundle Discount} = \begin{cases} 0\%, & \text{if } N_{\text{assets}} = 1 \\ 10\%, & \text{if } 2 \le N_{\text{assets}} \le 3 \\ 15\%, & \text{if } N_{\text{assets}} \ge 4 \end{cases}$$
$$\text{Net Deliverables Fee} = \text{Gross Deliverables Total} \times (1 - \text{Bundle Discount})$$

### **Formula 5: Commercial Rights & Exclusivity Upcharge**
$$\text{Commercial Rights Fee USD} = \text{Net Deliverables Fee} \times (\text{Usage \%} + \text{Exclusivity \%})$$

### **Formula 6: Regional Purchasing Power Parity (PPP) & Valuation Range**
$$\text{Total USD} = \text{Net Deliverables Fee} + \text{Commercial Rights Fee} + \text{Production Addons}$$
$$\text{Localized Median} = \text{Total USD} \times \text{Regional PPP Index} \times \text{FX Rate}$$
* **Low (25th Percentile):** $\text{Localized Median} \times 0.80$
* **Median (Typical):** $\text{Localized Median} \times 1.00$
* **High (75th Percentile):** $\text{Localized Median} \times 1.25$

---

## 3. 12 Real-World Scenario Validations (Engine Results)

Below are the 12 scenarios executed against our live TypeScript calculation engine:


### **Scenario 1: Nano Instagram Lifestyle Creator (Single Reel)**

* **Context:** A growing lifestyle creator in the US with 3,000 followers posting 1 standard Instagram Reel with organic usage.
* **Inputs:**
  * Followers / Subscribers: **3,000**
  * Engagement: **120 avg likes**, **10 avg comments** (4.33% vs 2.16% benchmark)
  * View Velocity: **1,500 avg views**
  * Niche Multiplier: **1.15x**
  * Performance Multiplier: **1.21x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $157 | $218 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $218
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $218
* **Total Base Valuation (USD):** **$218**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$175** | **$218** | **$273** |

---

### **Scenario 2: Micro YouTube Tech Reviewer (Integration + Short Bundle)**

* **Context:** An 18,000 subscriber YouTube tech channel providing a 60s sponsored integration plus 1 YouTube Short.
* **Inputs:**
  * Followers / Subscribers: **18,000**
  * Engagement: **650 avg likes**, **95 avg comments** (4.14% vs 1.36% benchmark)
  * View Velocity: **6,200 avg views**
  * Niche Multiplier: **1.35x**
  * Performance Multiplier: **1.29x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_integrated` | youtube | 1 | $400 | $694 |
| `yt_short` | youtube | 1 | $227 | $393 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $1,087
* **Volume Bundle Discount:** 10% (-$109)
* **Net Content Fee:** $979
* **Total Base Valuation (USD):** **$979**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$783** | **$979** | **$1,223** |

---

### **Scenario 3: Mid-Tier TikTok Gaming Creator (1x Video + 30-Day Paid Ads)**

* **Context:** A 120,000 follower TikTok gaming creator with strong viral reach, offering 1 dedicated video with 30-day paid ads usage rights.
* **Inputs:**
  * Followers / Subscribers: **120,000**
  * Engagement: **9,500 avg likes**, **450 avg comments** (8.29% vs 0.64% benchmark)
  * View Velocity: **65,000 avg views**
  * Niche Multiplier: **1.35x**
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 1 | $1,326 | $2,507 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $2,507
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $2,507
* **Commercial Rights & Exclusivity:** +$627
* **Total Base Valuation (USD):** **$3,133**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$2,507** | **$3,133** | **$3,917** |

---

### **Scenario 4: Macro Instagram Fashion Creator (Multi-Asset Package + Whitelisting & Exclusivity)**

* **Context:** A 450,000 follower fashion creator delivering a high-volume bundle (2 Reels, 1 Carousel, 1 Story set) with 60-day whitelisting and 30-day competitor exclusivity.
* **Inputs:**
  * Followers / Subscribers: **450,000**
  * Engagement: **8,200 avg likes**, **310 avg comments** (1.89% vs 0.56% benchmark)
  * View Velocity: **55,000 avg views**
  * Niche Multiplier: **0.9x**
  * Performance Multiplier: **1.33x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 2 | $4,667 | $11,186 |
| `ig_carousel` | instagram | 1 | $2,953 | $3,540 |
| `ig_story` | instagram | 1 | $1,160 | $1,390 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $16,116
* **Volume Bundle Discount:** 15% (-$2,417)
* **Net Content Fee:** $13,699
* **Commercial Rights & Exclusivity:** +$8,904
* **Total Base Valuation (USD):** **$22,603**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$18,083** | **$22,603** | **$28,254** |

---

### **Scenario 5: High-Ticket Finance YouTube Channel (Dedicated Video + Rush 48h + Raw Footage)**

* **Context:** An 85,000 subscriber personal finance YouTube authority delivering 1 full dedicated review with 48h rush turnaround and raw B-roll buyout.
* **Inputs:**
  * Followers / Subscribers: **85,000**
  * Engagement: **2,800 avg likes**, **420 avg comments** (3.79% vs 0.66% benchmark)
  * View Velocity: **32,000 avg views**
  * Niche Multiplier: **1.8x**
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_dedicated` | youtube | 1 | $2,309 | $5,196 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $5,196
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $5,196
* **Production Addons & Surcharges:** +$3,377
* **Total Base Valuation (USD):** **$8,573**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$6,858** | **$8,573** | **$10,716** |

---

### **Scenario 6: Beauty TikTok Creator (Saturated Niche with Low Engagement Penalty)**

* **Context:** A 50,000 follower beauty influencer experiencing below-benchmark engagement (clamped to 0.70x performance floor).
* **Inputs:**
  * Followers / Subscribers: **50,000**
  * Engagement: **200 avg likes**, **15 avg comments** (0.43% vs 0.77% benchmark)
  * View Velocity: **3,000 avg views**
  * Niche Multiplier: **0.75x**
  * Performance Multiplier: **0.7x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 1 | $743 | $390 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $390
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $390
* **Total Base Valuation (USD):** **$390**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$312** | **$390** | **$487** |

---

### **Scenario 7: Luxury Home Design Architect (High Multiplier with Damped Cap Enforcement)**

* **Context:** A 150,000 follower luxury interior architect (2.50x sub-niche + 1.25x luxury flag = 3.125x, damped at 2.25x safety cap).
* **Inputs:**
  * Followers / Subscribers: **150,000**
  * Engagement: **7,500 avg likes**, **380 avg comments** (5.25% vs 0.61% benchmark)
  * View Velocity: **45,000 avg views**
  * Niche Multiplier: **3.13x**
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $2,526 | $5,684 |
| `ig_carousel` | instagram | 1 | $1,605 | $3,612 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $9,296
* **Volume Bundle Discount:** 10% (-$930)
* **Net Content Fee:** $8,366
* **Total Base Valuation (USD):** **$8,366**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$6,693** | **$8,366** | **$10,458** |

---

### **Scenario 8: Viral Pet Care Account (High Engagement & View Velocity Ceiling)**

* **Context:** An 80,000 follower dog training channel with viral view velocity (120k avg views), reaching the maximum 1.40x performance ceiling.
* **Inputs:**
  * Followers / Subscribers: **80,000**
  * Engagement: **9,000 avg likes**, **600 avg comments** (12% vs 0.67% benchmark)
  * View Velocity: **120,000 avg views**
  * Niche Multiplier: **1.7x**
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $1,495 | $3,363 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $3,363
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $3,363
* **Total Base Valuation (USD):** **$3,363**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$2,691** | **$3,363** | **$4,204** |

---

### **Scenario 9: Regional UK Fitness Creator (GBP Currency & PPP Calibration)**

* **Context:** A 40,000 follower fitness creator in London, UK producing 1 Reel calibrated for UK purchasing power parity and GBP (£).
* **Inputs:**
  * Followers / Subscribers: **40,000**
  * Engagement: **1,100 avg likes**, **80 avg comments** (2.95% vs 0.86% benchmark)
  * View Velocity: **12,000 avg views**
  * Niche Multiplier: **0.95x**
  * Performance Multiplier: **1.33x**
  * Region: **UK (GBP)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `ig_reel` | instagram | 1 | $800 | $1,011 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $1,011
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $1,011
* **Total Base Valuation (USD):** **$1,011**

#### Final Valuation Range (GBP):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **£543** | **£679** | **£848** |

---

### **Scenario 10: Regional India Tech Creator (INR Currency & PPP Calibration)**

* **Context:** A 200,000 subscriber Indian tech YouTuber providing a 60s integration calibrated for Indian market economics in INR (₹).
* **Inputs:**
  * Followers / Subscribers: **200,000**
  * Engagement: **6,000 avg likes**, **500 avg comments** (3.25% vs 0.58% benchmark)
  * View Velocity: **50,000 avg views**
  * Niche Multiplier: **1.35x**
  * Performance Multiplier: **1.4x**
  * Region: **IN (INR)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_integrated` | youtube | 1 | $2,474 | $4,675 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $4,675
* **Volume Bundle Discount:** 0% (-$0)
* **Net Content Fee:** $4,675
* **Total Base Valuation (USD):** **$4,675**

#### Final Valuation Range (INR):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **₹74,954** | **₹93,692** | **₹117,115** |

---

### **Scenario 11: Regional Pakistan Lifestyle Vlogger (PKR Currency & PPP Calibration)**

* **Context:** A 90,000 follower Pakistani TikTok creator providing 2 dedicated TikTok videos calibrated in Pakistani Rupees (PKR).
* **Inputs:**
  * Followers / Subscribers: **90,000**
  * Engagement: **3,500 avg likes**, **250 avg comments** (4.17% vs 0.66% benchmark)
  * View Velocity: **25,000 avg views**
  * Niche Multiplier: **1.15x**
  * Performance Multiplier: **1.4x**
  * Region: **PK (PKR)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `tiktok_video` | tiktok | 2 | $1,113 | $3,584 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $3,584
* **Volume Bundle Discount:** 10% (-$358)
* **Net Content Fee:** $3,226
* **Total Base Valuation (USD):** **$3,226**

#### Final Valuation Range (PKR):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **Rs. 129,373** | **Rs. 161,716** | **Rs. 202,145** |

---

### **Scenario 12: Mega-Tier 360 Omnichannel Campaign (1.2M+ Followers, YT + IG + TikTok)**

* **Context:** A top-tier 1.2M creator delivering a 3-platform campaign (YT Dedicated Video + IG Reel + TikTok Video) with 12-month full category lockout exclusivity.
* **Inputs:**
  * Followers / Subscribers: **1,200,000**
  * Engagement: **45,000 avg likes**, **3,200 avg comments** (4.02% vs 0.6% benchmark)
  * View Velocity: **350,000 avg views**
  * Niche Multiplier: **1.6x**
  * Performance Multiplier: **1.4x**
  * Region: **US (USD)**

#### Itemized Line Items:
| Deliverable Format | Platform | Quantity | Unit Base USD | Final Deliverable Fee |
| :--- | :---: | :---: | :---: | :---: |
| `yt_dedicated` | youtube | 1 | $12,200 | $27,328 |
| `ig_reel` | instagram | 1 | $7,175 | $16,072 |
| `tiktok_video` | tiktok | 1 | $10,750 | $24,080 |

#### Cost Summary & Addons:
* **Gross Deliverables Total:** $67,480
* **Volume Bundle Discount:** 10% (-$6,748)
* **Net Content Fee:** $60,732
* **Commercial Rights & Exclusivity:** +$121,464
* **Total Base Valuation (USD):** **$182,196**

#### Final Valuation Range (USD):
| Metric | Low (25th Percentile) | Median (Typical Price) | High (75th Percentile) |
| :--- | :---: | :---: | :---: |
| **Market Valuation** | **$145,757** | **$182,196** | **$227,745** |

---
