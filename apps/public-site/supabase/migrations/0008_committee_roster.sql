-- The real 2024-25 committee: 40 members across 12 wings, replacing the
-- placeholder roster that 0007's wing seed was demonstrated with.
--
-- Three wings needed correcting against the actual designations — "Workshop"
-- is really "School Program & Workshop", "Content" is "Content and Creation",
-- and "Strategy & Sponsorship" was missing entirely.
--
-- The roster lives here as well as in the database so a rebuilt environment
-- comes up populated. /admin remains authoritative once it's running: this is
-- guarded on the member not already existing, so it will never overwrite an
-- edit or resurrect someone who has been removed.

update public.committee_wings
set name = 'School Program & Workshop',
    subtitle = 'Training programmes, fabrication and hands-on sessions'
where name = 'Workshop';

update public.committee_wings
set name = 'Content and Creation',
    subtitle = 'Media, documentation and the RoboSUST voice'
where name = 'Content';

insert into public.committee_wings (name, subtitle, sort_order)
select 'Strategy & Sponsorship', 'Partnerships, outreach and long-term positioning', 11
where not exists (select 1 from public.committee_wings where name = 'Strategy & Sponsorship');

insert into public.committee_members (name, designation, department_session, wing_id, role_level, sort_order)
select v.name, v.designation, v.dept, w.id, v.lvl, v.ord
from (values
  ('Dipongkar Chakma','President','EEE''21','Top Executive Leadership','head',0),
  ('Md Yak Safu','Director of Robotics','SWE''21','Top Executive Leadership','head',1),
  ('Nishat Tarannum Mim','Vice President','MAT''21','Vice Presidents','head',0),
  ('Md. Asad Shekh','Vice President','EEE''21','Vice Presidents','head',1),
  ('Md Mehedi Hassan','Vice President','EEE''21','Vice Presidents','head',2),
  ('Yuvraj Nabil Rahman','General Secretary','MAT''21','General Secretariat','head',0),
  ('Sukanta Biswas','Joint Secretary','EEE''21','General Secretariat','head',1),
  ('Shah Mohammad Abid','Asst. General Secretary','EEE''22','General Secretariat','assistant',0),
  ('Nujhat-e-alam Tanvin','Asst. General Secretary','EEE''23','General Secretariat','assistant',1),
  ('Md Fahim Talukder','Treasurer','EEE''21','Treasury','head',0),
  ('Md. Farhad Hossain Ovi','Asst. Treasurer','STA''23','Treasury','assistant',0),
  ('Mollah Omar Hamza','Secretary of Research & Development','CSE''22','Research & Development','head',0),
  ('Ishat Noor Mahi','Asst. Secretary of Research & Development','STA''24','Research & Development','assistant',0),
  ('Mushfiq Zubayer','Asst. Secretary of Research & Development','EEE''24','Research & Development','assistant',1),
  ('Imteaz Hossain','Secretary of Project and Planning','EEE''23','Project & Planning','head',0),
  ('Ahmed Istiaque','Secretary of Project and Planning','CSE''22','Project & Planning','head',1),
  ('Arjun Shil Roy','Asst. Secretary of Project & Planning','EEE''24','Project & Planning','assistant',0),
  ('Md. Abdullah Al Sami Chowdhury','Asst. Secretary of Project & Planning','EEE''24','Project & Planning','assistant',1),
  ('Dipanwita Shome','Operations Secretary','EEE''22','Operations','head',0),
  ('Akm Yeahhiya Siam','Operations Secretary','EEE''23','Operations','head',1),
  ('Zarif Hasan Sadik','Asst. Operation Secretary','EEE''24','Operations','assistant',0),
  ('Md. Abir Mahmud','Asst. Operation Secretary','EEE''24','Operations','assistant',1),
  ('Shommyadip Das','Organising Secretary','PME''23','Organising','head',0),
  ('Sirat Ahmed Shimanto','Asst. Organising Secretary','OCG''24','Organising','assistant',0),
  ('Ishmam Ahmed','Asst. Organising Secretary','STA''24','Organising','assistant',1),
  ('Prince Mazumder','Asst. Organising Secretary','STA''24','Organising','assistant',2),
  ('Nabiha Tahsin','IT Secretary','EEE''23','IT','head',0),
  ('Sheikh Wadil Ayman','Asst. IT Secretary','CSE''24','IT','assistant',0),
  ('Md Adib Al Zian','Asst. IT Secretary','SWE''23','IT','assistant',1),
  ('Nowrin Ara Nargish','Asst. IT Secretary','EEE''24','IT','assistant',2),
  ('Progga Paromita Chanda Awishi','Secretary of School Program & Workshop','OCG''22','School Program & Workshop','head',0),
  ('Humayra Jui','Secretary of School Program & Workshop','MAT''22','School Program & Workshop','head',1),
  ('Dhrubo Krishna Das','Asst. Secretary of School Program & Workshop','STA''24','School Program & Workshop','assistant',0),
  ('Nusrat Haque Faija','Asst. Secretary of School Program & Workshop','PHY''24','School Program & Workshop','assistant',1),
  ('Maria Mostary Mouri','Secretary of Content and Creation','EEE''23','Content and Creation','head',0),
  ('Sunzid Rahman Abir','Asst. Secretary of Content and Creation','EEE''24','Content and Creation','assistant',0),
  ('Quranul Islam Sahed','Asst. Secretary of Content and Creation','FET''24','Content and Creation','assistant',1),
  ('Surjita Datta','Asst. Secretary of Content and Creation','PHY''24','Content and Creation','assistant',2),
  ('Shafiqul Islam Fardin','Secretary of Strategy & Sponsorship','BBA''23','Strategy & Sponsorship','head',0),
  ('Zannatul Mawa Shathy','Asst. Secretary of Strategy & Sponsorship','EEE''24','Strategy & Sponsorship','assistant',0)
) as v(name, designation, dept, wing, lvl, ord)
join public.committee_wings w on w.name = v.wing
where not exists (select 1 from public.committee_members m where m.name = v.name);
