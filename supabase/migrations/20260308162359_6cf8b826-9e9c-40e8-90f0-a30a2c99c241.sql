
-- Remove duplicate shipping methods and update with accurate real-world rates
DELETE FROM shipping_methods;

-- USPS domestic rates (accurate for shoe-sized packages ~2-3 lbs)
INSERT INTO shipping_methods (carrier, name, description, price, estimated_days, min_order_amount, is_active, country_code) VALUES
  ('USPS', 'Ground Advantage', 'Affordable ground shipping for packages up to 70 lbs', 8.49, '5-7 business days', 150, true, 'US'),
  ('USPS', 'Priority Mail', 'Fast and reliable delivery with tracking and insurance', 15.99, '2-3 business days', 250, true, 'US'),
  ('USPS', 'Priority Mail Express', 'Overnight to 2-day guaranteed delivery', 28.99, '1-2 business days', NULL, true, 'US');

-- DHL international rates (accurate for shoe-sized packages ~2-3 lbs)
INSERT INTO shipping_methods (carrier, name, description, price, estimated_days, min_order_amount, is_active, country_code) VALUES
  ('DHL', 'Express Economy', 'Cost-effective international express shipping', 29.99, '5-8 business days', NULL, true, 'ALL'),
  ('DHL', 'Express Worldwide', 'Premium international express with full tracking', 44.99, '3-5 business days', NULL, true, 'ALL'),
  ('DHL', 'Express 9:00', 'Next business day delivery by 9:00 AM to major cities', 69.99, '1-2 business days', NULL, true, 'ALL');
