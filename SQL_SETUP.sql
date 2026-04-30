-- Run this in your Supabase SQL Editor to set up the required tables for SMM Nexus

-- 1. Create Profiles table (stores user balance)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Services table
CREATE TABLE IF NOT EXISTS public.services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Price per 1000
    min_qty INTEGER DEFAULT 10,
    max_qty INTEGER DEFAULT 100000,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    service_id INTEGER REFERENCES public.services(id) NOT NULL,
    link TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled, refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL, -- deposit, withdrawal, refund
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Services: Everyone can read services
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);

-- Orders: Users can read/insert their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: Users can view own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- 7. Trigger to automatically create profile on signup
-- Note: This is likely where your 'Database error' is coming from if misconfigured.
-- This function handles the creation of a profile record.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, balance)
  VALUES (new.id, new.raw_user_meta_data->>'username', 0.00);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The actual trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Seed some initial services
INSERT INTO public.services (name, category, price, min_qty, max_qty, description)
VALUES 
('Instagram Followers [Real]', 'Instagram', 1.50, 100, 10000, 'High quality real followers with 30 days refill.'),
('TikTok Likes [Instant]', 'TikTok', 0.80, 50, 50000, 'Instant delivery of likes for your TIkTok videos.'),
('YouTube Views [Safe]', 'YouTube', 3.20, 1000, 1000000, 'Non-drop organic views for your channel growth.');
