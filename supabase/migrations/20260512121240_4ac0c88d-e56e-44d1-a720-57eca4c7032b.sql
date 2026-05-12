
DELETE FROM public.expenses 
WHERE user_id = 'c585a299-139f-4783-ab8b-d24153499b65' 
  AND year = 2026 
  AND month IN ('January','February','March','April');

INSERT INTO public.expenses (user_id, year, month, category, items) VALUES
-- January
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'January', 'snacks', '[60,40,105,40,25,30,50,95,100,60,30,85,150,44]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'January', 'food', '[150,135,140,300]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'January', 'travellingCharge', '[110,500,25,100,65,121,60,200,118,200,118,90]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'January', 'otherExpenses', '[
  {"desc":"Dress","amount":2100},
  {"desc":"Jockey jacket","amount":1200},
  {"desc":"B gift","amount":1071},
  {"desc":"Nice road card","amount":150},
  {"desc":"Oil","amount":335},
  {"desc":"Chicken","amount":390},
  {"desc":"Bike service","amount":521},
  {"desc":"Police station","amount":1000},
  {"desc":"Varun gift","amount":500},
  {"desc":"Mangalore room","amount":2000},
  {"desc":"Chain spray","amount":160},
  {"desc":"Movie","amount":380},
  {"desc":"Grocery","amount":800},
  {"desc":"Santu petrol","amount":100},
  {"desc":"Helmet bluetooth","amount":1400},
  {"desc":"Bobo holder","amount":1800},
  {"desc":"Seat cover","amount":1425}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'January', 'selfExpense', '[
  {"desc":"PG Rent","amount":6000},
  {"desc":"Sim recharge","amount":3600},
  {"desc":"Hair cutting","amount":150}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'January', 'petrol', '[720,810,110,290,1593,900,1200,610]'::jsonb),

-- February
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'February', 'snacks', '[40,45,40,110,76,180,160]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'February', 'food', '[187,364,350,330,580]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'February', 'travellingCharge', '[500,65,200]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'February', 'otherExpenses', '[
  {"desc":"Amma","amount":2000},
  {"desc":"Ponds","amount":232},
  {"desc":"Air","amount":20}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'February', 'selfExpense', '[
  {"desc":"PG Rent","amount":6000}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'February', 'petrol', '[510,820,1220,610,160,160]'::jsonb),

-- March
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'March', 'snacks', '[380,15,20,60,260,20,95,40,130]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'March', 'food', '[175,450,142]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'March', 'travellingCharge', '[559,65,325,70]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'March', 'otherExpenses', '[
  {"desc":"Hen","amount":470},
  {"desc":"Hen","amount":62},
  {"desc":"Phone holder","amount":174},
  {"desc":"Cruise control","amount":435},
  {"desc":"Mill","amount":80},
  {"desc":"Amma","amount":1500},
  {"desc":"Bike accessories","amount":858},
  {"desc":"Phone display","amount":1225},
  {"desc":"RO drink","amount":160},
  {"desc":"Key bunch","amount":897},
  {"desc":"Chicken","amount":400}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'March', 'selfExpense', '[
  {"desc":"Movie","amount":180},
  {"desc":"Domain","amount":221},
  {"desc":"PG Rent","amount":6000}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'March', 'petrol', '[510,1100,420,520,160,160,520,210]'::jsonb),

-- April
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'April', 'snacks', '[60,60,105,125,130,40,10,40,200,90]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'April', 'food', '[574,60,170,100,400]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'April', 'travellingCharge', '[25,500,75,110,500,25,65,150,25]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'April', 'otherExpenses', '[
  {"desc":"Chicken","amount":240},
  {"desc":"Key chain","amount":300},
  {"desc":"CNG","amount":614},
  {"desc":"Go pro","amount":2600},
  {"desc":"Trip expenses","amount":1060},
  {"desc":"Hospital","amount":300},
  {"desc":"Hospital","amount":234},
  {"desc":"Hospital","amount":29},
  {"desc":"Interest","amount":1100},
  {"desc":"B-food","amount":359}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'April', 'selfExpense', '[
  {"desc":"Cutting","amount":500},
  {"desc":"PG Rent","amount":6000}
]'::jsonb),
('c585a299-139f-4783-ab8b-d24153499b65', 2026, 'April', 'petrol', '[520,520,1210,800,660,510,650,150]'::jsonb);
