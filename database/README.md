# Database Scripts

This directory contains the essential SQL scripts for order number management.

## 📁 Essential Files

### 1. `NO_LPAD_SOLUTION.sql` ⭐ **RECOMMENDED**
- **Purpose**: Main solution for order number management
- **Features**: 
  - No LPAD function (avoids PostgreSQL errors)
  - Continues sequence from backend orders
  - Automatic order number generation
- **Usage**: Run this script in Supabase SQL Editor

### 2. `COMPLETE_WORKING_SOLUTION.sql`
- **Purpose**: Comprehensive solution with all features
- **Features**: 
  - Complete database setup
  - Order number generation
  - Trigger creation
- **Usage**: Alternative to NO_LPAD_SOLUTION if you prefer LPAD

### 3. `FIX_MISSING_COLUMNS.sql`
- **Purpose**: Fix missing database columns
- **Features**: 
  - Adds missing columns (total, payment_method, etc.)
  - Sets default values
  - Includes test insert
- **Usage**: Run if you get column errors

### 4. `TEST_ORDER_NUMBER_FUNCTION.sql`
- **Purpose**: Test the order number function
- **Features**: 
  - Tests function existence
  - Tests function calls
  - Verifies sequence
- **Usage**: Run after applying main solution

## 🚀 Quick Start

1. **Run `NO_LPAD_SOLUTION.sql`** in Supabase SQL Editor
2. **Test with `TEST_ORDER_NUMBER_FUNCTION.sql`**
3. **Create a test order** to verify sequence continues

## 📋 Order Number Format

- **Format**: `ORD-YYYYMMDD-XXXX`
- **Example**: `ORD-20251012-9816`
- **Sequence**: Continues from backend orders

## ✅ What This Fixes

- ✅ **Sequence continuity**: Website continues from backend
- ✅ **No LPAD errors**: Uses manual padding
- ✅ **Automatic generation**: New orders get numbers automatically
- ✅ **Consistent numbering**: Both backend and website work together
