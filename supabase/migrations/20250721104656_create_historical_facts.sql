-- Create the historical_facts table
create table historical_facts (
  id uuid default gen_random_uuid() primary key,
  historical_date date not null,
  publish_date date not null default current_date,
  title text not null,
  description text not null,
  sources text[],
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index historical_facts_publish_date_idx on historical_facts(publish_date);
create index historical_facts_historical_date_idx on historical_facts(historical_date);
create index historical_facts_category_idx on historical_facts(category);

-- Create function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger historical_facts_updated_at
    before update on historical_facts
    for each row
    execute procedure update_updated_at_column();

-- Enable Row Level Security (RLS)
alter table historical_facts enable row level security;

-- Create RLS policies
create policy "Permitir lectura pública de hechos históricos"
  on historical_facts for select
  using (true);

create policy "Permitir escritura solo a administradores"
  on historical_facts for insert
  to authenticated
  with check (auth.jwt() ->> 'role' = 'admin');

-- Insert some sample data
insert into historical_facts (historical_date, publish_date, title, description, sources, category)
values
  ('1969-07-20', '2025-07-21', 'Primer alunizaje tripulado', 
   'El Apolo 11 se convierte en la primera misión espacial tripulada en llegar a la Luna. Neil Armstrong y Buzz Aldrin se convierten en los primeros seres humanos en pisar la superficie lunar.',
   array['NASA', 'https://www.nasa.gov/mission_pages/apollo/apollo11.html'],
   'Espacio'),
  ('1492-10-12', '2025-07-22', 'Cristóbal Colón llega a América', 
   'Cristóbal Colón llega al Nuevo Mundo, marcando el inicio de un período significativo de exploración y contacto entre Europa y América.',
   array['Diario de a bordo de Cristóbal Colón'],
   'Exploración'),
  ('1989-11-09', '2025-07-23', 'Caída del Muro de Berlín', 
   'El Muro de Berlín, símbolo de la Guerra Fría y la división entre Este y Oeste, comienza a ser derribado por ciudadanos de ambos lados.',
   array['Deutsche Welle', 'https://www.dw.com/es/caída-del-muro-de-berlin/'],
   'Política');
