-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin boolean DEFAULT false;