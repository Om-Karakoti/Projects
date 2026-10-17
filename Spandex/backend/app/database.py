import os
import re
import json
import logging
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Try psycopg2 for PostgreSQL
PSYCOPG2_AVAILABLE = False
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    logger.warning("psycopg2 is not installed. Database will run in resilient local cache mode.")

# Demo Merchants Data Definition
DEMO_MERCHANTS = [
    {
        "id": "MERCH_001",
        "name": "Sharma Kirana & Supermart",
        "category": "Grocery & Daily Needs",
        "city": "Jaipur, Rajasthan",
        "joined_date": "2024-01-15",
        "phone": "+91 98290 12345",
        "upi_vpa": "sharmakirana@paytm",
        "is_demo_data": True
    },
    {
        "id": "MERCH_002",
        "name": "Chai Junction & Quick Bites",
        "category": "Food & Beverage / QSR",
        "city": "Bengaluru, Karnataka",
        "joined_date": "2024-03-10",
        "phone": "+91 98450 67890",
        "upi_vpa": "chaijunction@paytm",
        "is_demo_data": True
    },
    {
        "id": "MERCH_003",
        "name": "TechZone Mobile & Accessories",
        "category": "Electronics & Gadgets",
        "city": "Noida, Uttar Pradesh",
        "joined_date": "2023-11-20",
        "phone": "+91 98110 54321",
        "upi_vpa": "techzone@paytm",
        "is_demo_data": True
    },
    {
        "id": "MERCH_004",
        "name": "Radhika Couture & Ethnic Boutique",
        "category": "Fashion & Apparel",
        "city": "Ahmedabad, Gujarat",
        "joined_date": "2024-02-01",
        "phone": "+91 97230 98765",
        "upi_vpa": "radhikacouture@paytm",
        "is_demo_data": True
    }
]

# Merchant-specific catalog products
MERCHANT_PRODUCTS = {
    "MERCH_001": [
        {"id": "P101", "name": "Fortune Sunlite Oil 1L", "category": "Cooking Oils", "price": 145.0, "cost": 128.0},
        {"id": "P102", "name": "Aashirvaad Atta 5kg", "category": "Flour & Grains", "price": 260.0, "cost": 235.0},
        {"id": "P103", "name": "Amul Butter 500g", "category": "Dairy", "price": 275.0, "cost": 255.0},
        {"id": "P104", "name": "Tata Tea Gold 500g", "category": "Beverages", "price": 310.0, "cost": 270.0},
        {"id": "P105", "name": "Surf Excel Matic 2kg", "category": "Household Cleaning", "price": 420.0, "cost": 370.0},
        {"id": "P106", "name": "India Gate Basmati Rice 5kg", "category": "Flour & Grains", "price": 540.0, "cost": 480.0},
        {"id": "P107", "name": "Haldiram Bhujia 400g", "category": "Snacks & Namkeen", "price": 120.0, "cost": 98.0},
        {"id": "P108", "name": "Dettol Liquid Handwash 750ml", "category": "Personal Care", "price": 115.0, "cost": 95.0},
        {"id": "P109", "name": "Cadbury Dairy Milk Silk 150g", "category": "Chocolates & Confectionery", "price": 180.0, "cost": 155.0},
        {"id": "P110", "name": "Organic Tur Dal 1kg", "category": "Pulses & Dals", "price": 175.0, "cost": 150.0}
    ],
    "MERCH_002": [
        {"id": "P201", "name": "Masala Chai (Kulhad)", "category": "Hot Beverages", "price": 30.0, "cost": 10.0},
        {"id": "P202", "name": "Adrak Elaichi Special Chai", "category": "Hot Beverages", "price": 40.0, "cost": 12.0},
        {"id": "P203", "name": "Bun Maska with Jam", "category": "Bakery & Toast", "price": 65.0, "cost": 24.0},
        {"id": "P204", "name": "Samosa (Plate of 2)", "category": "Snacks & Fried", "price": 50.0, "cost": 18.0},
        {"id": "P205", "name": "Paneer Grilled Sandwich", "category": "Sandwiches & Wraps", "price": 140.0, "cost": 55.0},
        {"id": "P206", "name": "Sev Puri Classic", "category": "Chaat & Street Food", "price": 80.0, "cost": 28.0},
        {"id": "P207", "name": "Dahi Papdi Chaat", "category": "Chaat & Street Food", "price": 110.0, "cost": 40.0},
        {"id": "P208", "name": "Cold Coffee with Ice Cream", "category": "Cold Beverages", "price": 120.0, "cost": 42.0},
        {"id": "P209", "name": "Aloo Tikki Burger", "category": "Quick Meals", "price": 95.0, "cost": 35.0},
        {"id": "P210", "name": "Rose Falooda", "category": "Desserts", "price": 130.0, "cost": 45.0}
    ],
    "MERCH_003": [
        {"id": "P301", "name": "Fast Charger 65W GaN", "category": "Cables & Adapters", "price": 1499.0, "cost": 850.0},
        {"id": "P302", "name": "Braided USB-C Cable (2m)", "category": "Cables & Adapters", "price": 449.0, "cost": 160.0},
        {"id": "P303", "name": "Tempered Glass Screen Protector", "category": "Cases & Protection", "price": 299.0, "cost": 65.0},
        {"id": "P304", "name": "Shockproof Armor Phone Case", "category": "Cases & Protection", "price": 599.0, "cost": 190.0},
        {"id": "P305", "name": "True Wireless Earbuds ANC", "category": "Audio & Headphones", "price": 2499.0, "cost": 1400.0},
        {"id": "P306", "name": "Power Bank 20000mAh 22.5W", "category": "Power & Batteries", "price": 1899.0, "cost": 1100.0},
        {"id": "P307", "name": "Magnetic Car Phone Mount", "category": "Car Accessories", "price": 799.0, "cost": 310.0},
        {"id": "P308", "name": "Smart Fitness Band Pro", "category": "Wearables", "price": 2999.0, "cost": 1850.0},
        {"id": "P309", "name": "Bluetooth Portable Speaker 10W", "category": "Audio & Headphones", "price": 1299.0, "cost": 720.0},
        {"id": "P310", "name": "Stylus Touch Pen for Tablet", "category": "Tablet Accessories", "price": 999.0, "cost": 450.0}
    ],
    "MERCH_004": [
        {"id": "P401", "name": "Handblock Cotton Anarkali Kurti", "category": "Ethnic Wear", "price": 1850.0, "cost": 950.0},
        {"id": "P402", "name": "Embroidered Chanderi Silk Dupatta", "category": "Dupattas & Stoles", "price": 1200.0, "cost": 550.0},
        {"id": "P403", "name": "Palazzo Pants (Linen Blend)", "category": "Bottom Wear", "price": 899.0, "cost": 420.0},
        {"id": "P404", "name": "Festive Bandhani Saree with Blouse", "category": "Sarees", "price": 3499.0, "cost": 1800.0},
        {"id": "P405", "name": "Floral Printed Summer Midi Dress", "category": "Western Wear", "price": 1650.0, "cost": 800.0},
        {"id": "P406", "name": "Georgette Festive Sharara Set", "category": "Ethnic Wear", "price": 4200.0, "cost": 2200.0},
        {"id": "P407", "name": "Oversized Linen Shirt", "category": "Western Wear", "price": 1350.0, "cost": 650.0},
        {"id": "P408", "name": "Handcrafted Kolhapuri Mojris", "category": "Footwear", "price": 1450.0, "cost": 700.0},
        {"id": "P409", "name": "Silver Oxidised Jhumka Earrings", "category": "Jewellery & Accessories", "price": 650.0, "cost": 220.0},
        {"id": "P410", "name": "Zari Work Potli Bag", "category": "Jewellery & Accessories", "price": 799.0, "cost": 320.0}
    ]
}

CATEGORY_CATALOGS = {
    "Pharmacy & Healthcare": [
        {"id": "PX01", "name": "Dolo 650mg Strip", "category": "Medicines & Tablets", "price": 32.0, "cost": 20.0},
        {"id": "PX02", "name": "Vitamin C + Zinc Chewable", "category": "Supplements", "price": 120.0, "cost": 65.0},
        {"id": "PX03", "name": "Volini Pain Relief Spray", "category": "First Aid & Relief", "price": 185.0, "cost": 140.0},
        {"id": "PX04", "name": "Dettol Antiseptic Liquid 250ml", "category": "Hygiene & Disinfection", "price": 115.0, "cost": 88.0},
        {"id": "PX05", "name": "Digital Forehead Thermometer", "category": "Healthcare Devices", "price": 899.0, "cost": 550.0},
        {"id": "PX06", "name": "Accu-Chek Blood Glucose Strips", "category": "Diagnostic Kits", "price": 850.0, "cost": 680.0},
        {"id": "PX07", "name": "Ayurvedic Cough Syrup 100ml", "category": "Herbal & Ayurvedic", "price": 95.0, "cost": 50.0},
        {"id": "PX08", "name": "Band-Aid Washproof 20s", "category": "First Aid & Relief", "price": 55.0, "cost": 38.0}
    ],
    "Bakery & Confectionery": [
        {"id": "BK01", "name": "Belgian Dark Chocolate Cake 500g", "category": "Cakes & Pastries", "price": 450.0, "cost": 180.0},
        {"id": "BK02", "name": "Artisanal Sourdough Loaf", "category": "Fresh Breads", "price": 110.0, "cost": 40.0},
        {"id": "BK03", "name": "Red Velvet Pastry", "category": "Cakes & Pastries", "price": 95.0, "cost": 35.0},
        {"id": "BK04", "name": "Paneer Tikka Puff", "category": "Savory Snacks", "price": 45.0, "cost": 16.0},
        {"id": "BK05", "name": "Butter Chocochip Cookies 200g", "category": "Cookies & Biscuits", "price": 130.0, "cost": 55.0},
        {"id": "BK06", "name": "Cold Cold Brew Coffee 300ml", "category": "Beverages", "price": 140.0, "cost": 40.0}
    ],
    "Salon & Personal Care": [
        {"id": "SL01", "name": "Executive Haircut & Styling", "category": "Hair Care", "price": 350.0, "cost": 80.0},
        {"id": "SL02", "name": "Beard Trim & Hot Towel Spa", "category": "Grooming", "price": 200.0, "cost": 40.0},
        {"id": "SL03", "name": "Detan Facial Treatment", "category": "Skin & Facials", "price": 850.0, "cost": 200.0},
        {"id": "SL04", "name": "Moroccan Hair Spa Treatment", "category": "Hair Care", "price": 1200.0, "cost": 350.0},
        {"id": "SL05", "name": "Organic Argan Hair Serum 100ml", "category": "Retail Products", "price": 650.0, "cost": 320.0}
    ],
    "Stationery & Books": [
        {"id": "ST01", "name": "Classmate Notebook Spiral 6-Pack", "category": "Notebooks", "price": 280.0, "cost": 190.0},
        {"id": "ST02", "name": "Parker Classic Ball Pen", "category": "Writing Instruments", "price": 250.0, "cost": 160.0},
        {"id": "ST03", "name": "Camel Artist Acrylic Color Box", "category": "Art Supplies", "price": 420.0, "cost": 290.0},
        {"id": "ST04", "name": "A4 Copier Paper Ream (500 Sheets)", "category": "Office Paper", "price": 310.0, "cost": 240.0},
        {"id": "ST05", "name": "Desk Organizer with Pen Stand", "category": "Office Supplies", "price": 350.0, "cost": 180.0}
    ]
}

PAYMENT_MODES = [
    ("Paytm Soundbox UPI", 0.52),
    ("Paytm Dynamic QR", 0.28),
    ("Paytm Debit/Credit Card", 0.12),
    ("Paytm Postpaid / BNPL", 0.05),
    ("Cash", 0.03)
]

def generate_synthetic_transactions(merchant_id: str, days: int = 90) -> List[Dict[str, Any]]:
    """
    Generates realistic, mathematically consistent Paytm merchant transaction history.
    Includes seasonal trends, day-of-week seasonality, hourly distributions,
    and merchant-specific business challenges (e.g. drop in repeat rates or slump hours).
    """
    random.seed(42 + hash(merchant_id) % 1000)
    np.random.seed(42 + hash(merchant_id) % 1000)
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    products = MERCHANT_PRODUCTS.get(merchant_id, MERCHANT_PRODUCTS["MERCH_001"])
    
    # Establish customer pool (mix of loyal, regular, and one-off)
    num_unique_customers = 180 if merchant_id in ["MERCH_001", "MERCH_002"] else 95
    customer_pool = [f"CUST_{merchant_id[-3:]}_{i:04d}" for i in range(1, num_unique_customers + 1)]
    # Loyalists (top 20% who visit frequently)
    loyal_customers = customer_pool[: int(num_unique_customers * 0.25)]
    regular_customers = customer_pool[int(num_unique_customers * 0.25): int(num_unique_customers * 0.65)]
    occasional_customers = customer_pool[int(num_unique_customers * 0.65):]
    
    transactions = []
    tx_counter = 1000
    
    # Base daily transactions volume
    base_tx_count = {
        "MERCH_001": 55,
        "MERCH_002": 75,
        "MERCH_003": 18,
        "MERCH_004": 14
    }.get(merchant_id, 30)

    for d in range(days):
        current_day = start_date + timedelta(days=d)
        weekday = current_day.weekday() # 0 = Monday, 6 = Sunday
        
        # Day of week factor
        day_factor = 1.0
        if weekday in [5, 6]: # Weekend boost
            day_factor = 1.35 if merchant_id in ["MERCH_001", "MERCH_004"] else 1.2
        elif weekday in [1, 2]: # Tue/Wed mid-week dip
            day_factor = 0.82
            
        # Recent trend factor for merchants
        # MERCH_001 has recent ATV decline over last 14 days
        # MERCH_002 has recent repeat customer drop over last 20 days
        days_from_end = days - d
        recent_trend = 1.0
        if merchant_id == "MERCH_001" and days_from_end <= 14:
            recent_trend = 0.90 # 10% volume slump
        elif merchant_id == "MERCH_003" and days_from_end <= 10:
            recent_trend = 1.15 # Festive acceleration

        daily_count = int(base_tx_count * day_factor * recent_trend * np.random.uniform(0.85, 1.15))
        
        for _ in range(daily_count):
            tx_counter += 1
            
            # Hourly distribution based on merchant type
            if merchant_id == "MERCH_002": # Cafe: peak 8-11am and 5-9pm, slump 2-4pm
                hour_weights = [0, 0, 0, 0, 0, 0, 0, 2, 7, 8, 7, 5, 4, 3, 2, 3, 5, 8, 10, 8, 5, 2, 1, 0]
            elif merchant_id == "MERCH_001": # Kirana: peak 9-12pm and 6-9pm
                hour_weights = [0, 0, 0, 0, 0, 0, 1, 3, 6, 8, 7, 6, 4, 3, 3, 4, 6, 9, 10, 8, 4, 1, 0, 0]
            else: # Retail
                hour_weights = [0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 6, 6, 5, 5, 6, 8, 9, 8, 5, 2, 0, 0, 0]
                
            hour_prob = np.array(hour_weights, dtype=float)
            hour_prob /= hour_prob.sum()
            hour = np.random.choice(range(24), p=hour_prob)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            tx_time = current_day.replace(hour=hour, minute=minute, second=second)
            
            # Select Customer
            # In MERCH_002, if recent 20 days, loyal customers visit less frequently (churn issue)
            if merchant_id == "MERCH_002" and days_from_end <= 20:
                cust_type = np.random.choice(["loyal", "regular", "occasional"], p=[0.20, 0.40, 0.40])
            else:
                cust_type = np.random.choice(["loyal", "regular", "occasional"], p=[0.45, 0.35, 0.20])
                
            if cust_type == "loyal":
                cust_id = random.choice(loyal_customers)
            elif cust_type == "regular":
                cust_id = random.choice(regular_customers)
            else:
                cust_id = random.choice(occasional_customers)
                
            # Select Product
            prod = random.choice(products)
            
            # In MERCH_001, recent baskets have fewer items or lower price
            price_multiplier = 1.0
            if merchant_id == "MERCH_001" and days_from_end <= 14:
                price_multiplier = 0.85
                
            quantity = 1
            if merchant_id == "MERCH_001":
                quantity = random.choices([1, 2, 3], weights=[0.65, 0.25, 0.10])[0]
            elif merchant_id == "MERCH_002":
                quantity = random.choices([1, 2, 3, 4], weights=[0.55, 0.30, 0.10, 0.05])[0]
                
            amount = round(prod["price"] * quantity * price_multiplier, 2)
            
            # Payment mode
            p_modes, p_probs = zip(*PAYMENT_MODES)
            p_mode = np.random.choice(p_modes, p=p_probs)
            
            discount = 0.0
            if random.random() < 0.15:
                discount = round(amount * random.choice([0.05, 0.10, 0.15]), 2)
                
            net_amount = max(round(amount - discount, 2), 5.0)

            transactions.append({
                "id": f"TX_{merchant_id[-3:]}_{tx_counter}",
                "merchant_id": merchant_id,
                "customer_id": cust_id,
                "timestamp": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                "amount": net_amount,
                "payment_mode": p_mode,
                "status": "SUCCESS",
                "product_id": prod["id"],
                "product_name": prod["name"],
                "category": prod["category"],
                "quantity": quantity,
                "discount_applied": discount,
                "is_demo_data": True
            })
            
    return transactions

class DatabaseManager:
    """
    Unified Database Manager.
    Works directly with PostgreSQL when available and configured.
    Maintains an in-memory transactional cache loaded with authentic Paytm Demo Data
    for instant responsiveness and offline development resilience.
    """
    def __init__(self, connection_url: Optional[str] = None):
        self.connection_url = connection_url or os.getenv("DATABASE_URL", "")
        self.pg_conn = None
        self.using_postgres = False
        
        # Local cached data store
        self.merchants: Dict[str, Dict[str, Any]] = {m["id"]: m for m in DEMO_MERCHANTS}
        self.transactions: Dict[str, List[Dict[str, Any]]] = {}
        self.recommendations_log: List[Dict[str, Any]] = []
        
        self._initialize_demo_data()
        self._try_connect_postgres()
        
    def _initialize_demo_data(self):
        """Populates rich demo data for all merchants."""
        for m in DEMO_MERCHANTS:
            m_id = m["id"]
            self.transactions[m_id] = generate_synthetic_transactions(m_id, days=90)
            logger.info(f"Initialized {len(self.transactions[m_id])} demo transactions for {m['name']}")

    def _try_connect_postgres(self):
        if not PSYCOPG2_AVAILABLE or not self.connection_url:
            logger.info("Using resilient in-memory PostgreSQL store for development/demo.")
            return

        try:
            conn = psycopg2.connect(self.connection_url, connect_timeout=3)
            conn.autocommit = True
            self.pg_conn = conn
            self.using_postgres = True
            logger.info("Connected to PostgreSQL successfully.")
            self._create_pg_tables()
            self._sync_demo_data_to_pg()
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL instance ({e}). Operating in resilient offline store.")
            self.using_postgres = False

    def _create_pg_tables(self):
        if not self.using_postgres or not self.pg_conn:
            return
        try:
            with self.pg_conn.cursor() as cur:
                cur.execute("""
                CREATE TABLE IF NOT EXISTS merchants (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    city VARCHAR(100),
                    joined_date VARCHAR(50),
                    phone VARCHAR(50),
                    upi_vpa VARCHAR(100),
                    is_demo_data BOOLEAN DEFAULT TRUE
                );
                
                CREATE TABLE IF NOT EXISTS transactions (
                    id VARCHAR(50) PRIMARY KEY,
                    merchant_id VARCHAR(50) REFERENCES merchants(id),
                    customer_id VARCHAR(50) NOT NULL,
                    timestamp TIMESTAMP NOT NULL,
                    amount NUMERIC(10, 2) NOT NULL,
                    payment_mode VARCHAR(50),
                    status VARCHAR(20),
                    product_id VARCHAR(50),
                    product_name VARCHAR(255),
                    category VARCHAR(100),
                    quantity INT DEFAULT 1,
                    discount_applied NUMERIC(10, 2) DEFAULT 0,
                    is_demo_data BOOLEAN DEFAULT TRUE
                );
                
                CREATE TABLE IF NOT EXISTS recommendations_log (
                    id VARCHAR(50) PRIMARY KEY,
                    merchant_id VARCHAR(50) REFERENCES merchants(id),
                    created_at TIMESTAMP NOT NULL,
                    action TEXT NOT NULL,
                    problem_detected TEXT NOT NULL,
                    impact_estimate TEXT,
                    confidence_score NUMERIC(5, 2),
                    status VARCHAR(50) DEFAULT 'active'
                );
                """)
                logger.info("PostgreSQL tables ensured.")
        except Exception as e:
            logger.error(f"Error creating PostgreSQL tables: {e}")

    def _sync_demo_data_to_pg(self):
        if not self.using_postgres or not self.pg_conn:
            return
        try:
            with self.pg_conn.cursor() as cur:
                # Check if merchants already seeded
                cur.execute("SELECT COUNT(*) FROM merchants;")
                count = cur.fetchone()[0]
                if count == 0:
                    for m in DEMO_MERCHANTS:
                        cur.execute("""
                        INSERT INTO merchants (id, name, category, city, joined_date, phone, upi_vpa, is_demo_data)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING;
                        """, (m["id"], m["name"], m["category"], m["city"], m["joined_date"], m["phone"], m["upi_vpa"], True))
                    
                    for m_id, txs in self.transactions.items():
                        for tx in txs[:500]: # Seed sample in PostgreSQL
                            cur.execute("""
                            INSERT INTO transactions (id, merchant_id, customer_id, timestamp, amount, payment_mode, status, product_id, product_name, category, quantity, discount_applied, is_demo_data)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id) DO NOTHING;
                            """, (tx["id"], tx["merchant_id"], tx["customer_id"], tx["timestamp"], tx["amount"], tx["payment_mode"], tx["status"], tx["product_id"], tx["product_name"], tx["category"], tx["quantity"], tx["discount_applied"], True))
                    logger.info("Demo data successfully synchronized to PostgreSQL.")
        except Exception as e:
            logger.error(f"Error syncing data to PostgreSQL: {e}")

    def get_all_merchants(self) -> List[Dict[str, Any]]:
        return list(self.merchants.values())

    def get_merchant_by_id(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        return self.merchants.get(merchant_id)

    def get_merchant_transactions_df(self, merchant_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> pd.DataFrame:
        raw_txs = self.transactions.get(merchant_id, [])
        if not raw_txs:
            return pd.DataFrame()
            
        df = pd.DataFrame(raw_txs)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)
        df["discount_applied"] = pd.to_numeric(df["discount_applied"], errors="coerce").fillna(0.0)
        
        if start_date:
            df = df[df["timestamp"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["timestamp"] <= pd.to_datetime(end_date)]
            
        return df.sort_values(by="timestamp").reset_index(drop=True)

    def create_merchant(self, data: Dict[str, Any], seed_sample_transactions: bool = True) -> Dict[str, Any]:
        """Registers a new merchant with necessary business profile details and optional initial transaction activity."""
        # Generate clean unique ID
        m_id = f"MERCH_{len(self.merchants) + 1:03d}"
        while m_id in self.merchants:
            m_id = f"MERCH_{random.randint(100, 999)}"

        raw_name = data["name"].strip()
        raw_cat = data["category"].strip()
        raw_city = data["city"].strip()
        raw_phone = data["phone"].strip()

        clean_handle = re.sub(r'[^a-zA-Z0-9]', '', raw_name).lower()[:15]
        upi_vpa = data.get("upi_vpa")
        if not upi_vpa or not upi_vpa.strip():
            upi_vpa = f"{clean_handle}@paytm"
        elif not upi_vpa.endswith("@paytm") and "@" not in upi_vpa:
            upi_vpa = f"{upi_vpa.strip()}@paytm"

        merchant_record = {
            "id": m_id,
            "name": raw_name,
            "category": raw_cat,
            "city": raw_city,
            "joined_date": datetime.now().strftime("%Y-%m-%d"),
            "phone": raw_phone,
            "upi_vpa": upi_vpa,
            "is_demo_data": False
        }

        self.merchants[m_id] = merchant_record

        # Setup catalog based on category
        cat_lower = raw_cat.lower()
        if any(w in cat_lower for w in ["pharmacy", "medical", "health", "chem"]):
            MERCHANT_PRODUCTS[m_id] = CATEGORY_CATALOGS["Pharmacy & Healthcare"]
        elif any(w in cat_lower for w in ["bake", "sweet", "cake", "pastry"]):
            MERCHANT_PRODUCTS[m_id] = CATEGORY_CATALOGS["Bakery & Confectionery"]
        elif any(w in cat_lower for w in ["salon", "beauty", "spa", "hair", "barber"]):
            MERCHANT_PRODUCTS[m_id] = CATEGORY_CATALOGS["Salon & Personal Care"]
        elif any(w in cat_lower for w in ["book", "stationery", "paper", "pen"]):
            MERCHANT_PRODUCTS[m_id] = CATEGORY_CATALOGS["Stationery & Books"]
        elif any(w in cat_lower for w in ["food", "cafe", "restaurant", "tea", "coffee", "bites", "dining"]):
            MERCHANT_PRODUCTS[m_id] = MERCHANT_PRODUCTS["MERCH_002"]
        elif any(w in cat_lower for w in ["electronic", "mobile", "gadget", "phone", "tech"]):
            MERCHANT_PRODUCTS[m_id] = MERCHANT_PRODUCTS["MERCH_003"]
        elif any(w in cat_lower for w in ["fashion", "wear", "boutique", "cloth", "garment", "apparel"]):
            MERCHANT_PRODUCTS[m_id] = MERCHANT_PRODUCTS["MERCH_004"]
        else:
            MERCHANT_PRODUCTS[m_id] = MERCHANT_PRODUCTS["MERCH_001"]

        if seed_sample_transactions:
            txs = generate_synthetic_transactions(m_id, days=60)
            self.transactions[m_id] = txs
            logger.info(f"Generated {len(txs)} initial transactions for new merchant {raw_name}")
        else:
            self.transactions[m_id] = []

        # If PostgreSQL is active, persist to database
        if self.using_postgres and self.pg_conn:
            try:
                with self.pg_conn.cursor() as cur:
                    cur.execute("""
                    INSERT INTO merchants (id, name, category, city, joined_date, phone, upi_vpa, is_demo_data)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        city = EXCLUDED.city,
                        phone = EXCLUDED.phone,
                        upi_vpa = EXCLUDED.upi_vpa;
                    """, (
                        merchant_record["id"],
                        merchant_record["name"],
                        merchant_record["category"],
                        merchant_record["city"],
                        merchant_record["joined_date"],
                        merchant_record["phone"],
                        merchant_record["upi_vpa"],
                        False
                    ))

                    if seed_sample_transactions and self.transactions.get(m_id):
                        for tx in self.transactions[m_id][:300]:
                            cur.execute("""
                            INSERT INTO transactions (id, merchant_id, customer_id, timestamp, amount, payment_mode, status, product_id, product_name, category, quantity, discount_applied, is_demo_data)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id) DO NOTHING;
                            """, (
                                tx["id"], tx["merchant_id"], tx["customer_id"], tx["timestamp"],
                                tx["amount"], tx["payment_mode"], tx["status"], tx["product_id"],
                                tx["product_name"], tx["category"], tx["quantity"], tx["discount_applied"], False
                            ))
            except Exception as e:
                logger.error(f"Error persisting registered merchant to PostgreSQL: {e}")

        return merchant_record

    def log_recommendation_action(self, merchant_id: str, rec_id: str, action: str) -> Dict[str, Any]:
        log_entry = {
            "id": f"REC_LOG_{len(self.recommendations_log)+1}",
            "merchant_id": merchant_id,
            "rec_id": rec_id,
            "action": action,
            "created_at": datetime.now().isoformat(),
            "status": "simulated_accepted"
        }
        self.recommendations_log.append(log_entry)
        return log_entry

# Global database manager instance
db = DatabaseManager()
