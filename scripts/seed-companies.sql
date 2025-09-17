----------------------------------------------------------------
-- Clean Companies Seed Data
-- This script inserts all 115 companies from the marketplace
----------------------------------------------------------------

-- Financial Services Companies (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES 
('First National Bank','first-national-bank','Provides personal checking, savings, and lending solutions.','www.fnb.com','120 Main St','Dallas','TX','75201','(214) 555-0101','support@fnb.com','active'),
('Union Credit Cooperative','union-credit-cooperative','Member-owned credit union offering loans and savings accounts.','www.unioncredit.coop','200 Maple Avenue','Denver','CO','80203','(303) 555-0112','info@unioncredit.coop','active'),
('Precision Bookkeeping','precision-bookkeeping','Daily bookkeeping and accounting services for individuals and small businesses.','www.precisionbookkeeping.com','456 Market Street','San Francisco','CA','94104','(415) 555-0123','info@precisionbookkeeping.com','active'),
('ClearTax Consulting','cleartax-consulting','Tax planning and preparation services for individuals and corporations.','www.cleartaxconsulting.com','789 Ocean Drive','Miami','FL','33132','(305) 555-0987','info@cleartaxconsulting.com','active'),
('WealthWise Financial','wealthwise-financial','Personal financial planning, investment guidance, and retirement strategies.','www.wealthwise.com','321 Oak Street','Chicago','IL','60611','(312) 555-0145','info@wealthwise.com','active');

-- Healthcare Companies (3)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('City Hospital','city-hospital','Comprehensive inpatient and outpatient medical care.','www.cityhospital.com','101 Health Blvd','New York','NY','10016','(212) 555-0133','info@cityhospital.com','active'),
('QuickCare Urgent Clinic','quickcare-urgent-clinic','Immediate treatment for non-life-threatening conditions.','www.quickcare.com','55 Main Street','Austin','TX','78701','(512) 555-0144','contact@quickcare.com','active'),
('Heart & Lung Specialty Clinic','heart-and-lung-specialty-clinic','Specialized care in cardiology and pulmonology.','www.heartlungclinic.com','88 Medical Park','Boston','MA','02118','(617) 555-0155','info@heartlungclinic.com','active');

-- Dental Services (3)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Smile Dental','smile-dental','Routine dental check-ups and cleanings.','www.smiledental.com','100 Smile Lane','Los Angeles','CA','90012','(213) 555-0166','contact@smiledental.com','active'),
('Align Orthodontics','align-orthodontics','Braces and aligners for children and adults.','www.alignortho.com','200 Brace Street','Chicago','IL','60610','(312) 555-0177','support@alignortho.com','active'),
('OralCare Surgery Center','oralcare-surgery-center','Specialized oral surgical procedures.','www.oralcare.com','300 Dental Ave','Seattle','WA','98101','(206) 555-0188','info@oralcare.com','active');

-- Mental Health Services (3)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('MindBalance Therapy','mindbalance-therapy','Counseling and psychotherapy services.','www.mindbalance.com','120 Wellness Rd','Miami','FL','33130','(305) 555-0199','info@mindbalance.com','active'),
('Peak Psychiatry','peak-psychiatry','Mental health evaluations and psychiatric care.','www.peakpsychiatry.com','44 Brain Street','Denver','CO','80204','(303) 555-0200','contact@peakpsychiatry.com','active'),
('Recovery Path','recovery-path','Substance abuse treatment and recovery programs.','www.recoverypath.com','88 Hope Lane','Boston','MA','02118','(617) 555-0211','info@recoverypath.com','active');

-- Therapy Services (3)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('MoveWell Physical Therapy','movewell-physical-therapy','Rehabilitation and mobility improvement programs.','www.movewell.com','55 Rehab Street','Los Angeles','CA','90012','(213) 555-0222','contact@movewell.com','active'),
('SkillMotion Occupational Therapy','skillmotion-occupational-therapy','Support for daily living and occupational skills.','www.skillmotion.com','78 Therapy Blvd','Chicago','IL','60610','(312) 555-0233','info@skillmotion.com','active'),
('SpeechEase Therapy','speechease-therapy','Speech and language therapy services.','www.speechease.com','22 Voice Lane','Seattle','WA','98101','(206) 555-0244','info@speechease.com','active');

-- Wellness Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('NutriGuide','nutriguide','Personal nutrition and diet planning.','www.nutriguide.com','101 Health Ave','Miami','FL','33132','(305) 555-0255','info@nutriguide.com','active'),
('FitPro Training','fitpro-training','Personalized fitness coaching and exercise programs.','www.fitpro.com','55 Gym Street','Austin','TX','78701','(512) 555-0266','contact@fitpro.com','active'),
('Relaxation Spa','relaxation-spa','Therapeutic massage and wellness treatments.','www.relaxspa.com','120 Wellness Way','Denver','CO','80204','(303) 555-0277','info@relaxspa.com','active'),
('Luxury Salon & Spa','luxury-salon-and-spa','Hair, beauty, and spa services.','www.luxurysalon.com','88 Beauty Blvd','New York','NY','10016','(212) 555-0288','contact@luxurysalon.com','active');

-- Plumbing Services (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Flow Rite Plumbing Co.','flow-rite-plumbing-co','Cleaning and maintenance of plumbing drains.','www.flowriteplumbing.com','4487 Sunset Boulevard','Los Angeles','CA','90027','(213) 555-0123','service@flowriteplumbing.com','active'),
('PipeMasters','pipemasters','Installation and repair of plumbing pipes.','www.pipemasters.com','500 Oak Street','Seattle','WA','98101','(206) 555-0134','support@pipemasters.com','active'),
('GasSafe Installers','gassafe-installers','Installation and maintenance of gas lines.','www.gassafe.com','88 Energy Ave','Houston','TX','77002','(713) 555-0145','contact@gassafe.com','active'),
('Septic Solutions','septic-solutions','Septic system installation and repair.','www.septicsolutions.com','120 Waste Lane','Denver','CO','80204','(303) 555-0156','info@septicsolutions.com','active'),
('PlumbRight Industrial','plumbright-industrial','Commercial plumbing services including drains, pipe, gas, and septic.','www.plumbright.com','88 Pipe Lane','Los Angeles','CA','90012','(323) 555-0455','info@plumbright.com','active');

-- Electrical Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('BrightWire Electric','brightwire-electric','Electrical wiring and repair for homes.','www.brightwireelectric.com','2211 E Texas Street','Dallas','TX','75201','(214) 555-0198','support@brightwireelectric.com','active'),
('GenPower Installers','genpower-installers','Backup generator installation and maintenance.','www.genpower.com','300 Generator Blvd','Miami','FL','33137','(305) 555-0167','contact@genpower.com','active'),
('LightFix Solutions','lightfix-solutions','Indoor and outdoor lighting repair services.','www.lightfix.com','200 Lamp Street','New York','NY','10010','(212) 555-0178','support@lightfix.com','active'),
('HighVolt Electrical','highvolt-electrical','Industrial and high voltage electrical services including lighting.','www.highvolt.com','55 Power St','Dallas','TX','75201','(214) 555-0466','support@highvolt.com','active');

-- HVAC Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('AirFlow Solutions HVAC','airflow-solutions-hvac','Installation and maintenance of heating systems.','www.airflowsolutionshvac.com','3301 Biscayne Boulevard','Miami','FL','33137','(305) 555-0110','contact@airflowsolutionshvac.com','active'),
('CoolBreeze HVAC','coolbreeze-hvac','AC installation, repair, and maintenance.','www.coolbreeze.com','400 Chill Street','Austin','TX','78701','(512) 555-0181','support@coolbreeze.com','active'),
('FreezeTech Refrigeration','freezetech-refrigeration','Commercial and residential refrigeration services.','www.freezetech.com','88 Ice Lane','Denver','CO','80204','(303) 555-0192','info@freezetech.com','active'),
('CoolAir HVAC','coolair-hvac','Commercial heating, cooling, and refrigeration services.','www.coolairhvac.com','200 Chill Blvd','Miami','FL','33132','(305) 555-0477','info@coolairhvac.com','active');

-- Carpentry Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Craftsman Carpentry','craftsman-carpentry','Structural framing and carpentry work.','www.craftsmancarpentry.com','845 N Michigan Avenue','Chicago','IL','60611','(312) 555-0181','info@craftsmancarpentry.com','active'),
('CabinetPro','cabinetpro','Custom cabinets and wood storage solutions.','www.cabinetpro.com','200 Wood Street','Seattle','WA','98101','(206) 555-0202','info@cabinetpro.com','active'),
('FinishWorks','finishworks','Interior finish carpentry work.','www.finishworks.com','300 Interior Lane','Miami','FL','33132','(305) 555-0213','contact@finishworks.com','active'),
('MasterCarpentry','mastercarpentry','Commercial carpentry including framing, cabinetry, and finish work.','www.mastercarpentry.com','321 Woodwork Lane','Chicago','IL','60611','(312) 555-0488','contact@mastercarpentry.com','active');

-- Masonry Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('StoneCraft Masonry','stonecraft-masonry','Brick masonry construction and repair.','www.stonecraftmasonry.com','180 Congress Street','Boston','MA','02110','(617) 555-0143','contact@stonecraftmasonry.com','active'),
('RockSolid','rocksolid','Stone masonry and hardscape services.','www.rocksolid.com','88 Granite Ave','Denver','CO','80204','(303) 555-0224','info@rocksolid.com','active'),
('Concrete Pros','concrete-pros','Concrete installation, repair, and finishing.','www.concretepros.com','120 Cement Street','Chicago','IL','60611','(312) 555-0235','support@concretepros.com','active'),
('MasonWorks','masonworks','Concrete, brick, and stone masonry services.','www.masonworks.com','101 Stone Ave','Denver','CO','80204','(303) 555-0499','info@masonworks.com','active');

-- Roofing Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Peak Roofing Solutions','peak-roofing-solutions','Shingle roof installation and repair services.','www.peakroofing.com','1029 Redwood Way','Portland','OR','97205','(503) 555-0142','info@peakroofing.com','active'),
('MetalMasters','metalmasters','Metal roofing services and installation.','www.metalmasters.com','200 Steel Blvd','Houston','TX','77002','(713) 555-0246','support@metalmasters.com','active'),
('FlatRoof Solutions','flatroof-solutions','Flat roof construction and maintenance.','www.flatroofsolutions.com','88 Skyline Lane','Los Angeles','CA','90012','(213) 555-0257','info@flatroofsolutions.com','active'),
('RoofPro Solutions','roofpro-solutions','Flat, metal, and shingle roofing services for commercial buildings.','www.roofpro.com','88 Roofing Rd','Los Angeles','CA','90012','(323) 555-0500','support@roofpro.com','active');

-- Landscaping Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('TreeMight Arborists','treemight-arborists','Tree trimming, pruning, and health services.','www.treemightarborists.com','421 Division Street','Spokane','WA','99201','(509) 555-0195','info@treemight.com','active'),
('Irrigate Pros','irrigate-pros','Sprinkler and irrigation system installation.','www.irrigatepros.com','120 Sprinkler Lane','Denver','CO','80204','(303) 555-0268','contact@irrigatepros.com','active'),
('Lawn Masters','lawn-masters','Lawn and turf installation and maintenance.','www.lawnmasters.com','88 Turf Lane','Austin','TX','78701','(512) 555-0279','info@lawnmasters.com','active'),
('StumpBusters','stumpbusters','Tree stump removal and grinding services.','www.stumpbusters.com','200 Grind Street','Miami','FL','33132','(305) 555-0280','support@stumpbusters.com','active');

-- Legal Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('FamilyFirst Law','familyfirst-law','Legal services for family law matters.','www.familyfirst.com','120 Justice Blvd','New York','NY','10016','(212) 555-0291','contact@familyfirst.com','active'),
('CrossBorder Immigration Services','crossborder-immigration-services','Immigration legal services and visa assistance.','www.crossborderimmigration.com','3300 Wilshire Blvd','Los Angeles','CA','90010','(323) 555-0111','services@crossborderimmigration.com','active'),
('EstateWise Planning','estatewise-planning','Wills, trusts, and estate management services.','www.estatewise.com','88 Wealth Lane','Miami','FL','33132','(305) 555-0122','info@estatewise.com','active'),
('ConsumerProtect','consumerprotect','Protection of consumer rights and dispute resolution.','www.consumerprotect.com','101 Rights Ave','Denver','CO','80204','(303) 555-0133','contact@consumerprotect.com','active');

-- Education Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Bright Futures School','bright-futures-school','Primary, secondary, and high school educational services.','www.brightfutures.com','120 Learning Blvd','Chicago','IL','60611','(312) 555-0144','info@brightfutures.com','active'),
('SmartTutors','smarttutors','Academic tutoring and test preparation for all ages.','www.smarttutors.com','88 Academic Lane','Boston','MA','02110','(617) 555-0155','contact@smarttutors.com','active'),
('Little Stars Daycare','little-stars-daycare','Childcare and early learning programs.','www.littlestars.com','200 Childcare Rd','Denver','CO','80204','(303) 555-0166','info@littlestars.com','active'),
('CareerTech Vocational','careertech-vocational','Vocational training and technical career programs.','www.careertech.com','55 Trade Street','Miami','FL','33132','(305) 555-0177','contact@careertech.com','active');

-- Travel & Hospitality (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('City Bites Cafe','city-bites-cafe','Dining and food services.','www.citybites.com','120 Food Lane','New York','NY','10016','(212) 555-0188','contact@citybites.com','active'),
('Urban Stay Hotels','urban-stay-hotels','Short-term lodging and hospitality services.','www.urbanstay.com','88 Hospitality Ave','Los Angeles','CA','90012','(323) 555-0199','info@urbanstay.com','active'),
('SkyHigh Airlines','skyhigh-airlines','Air travel and tourism services.','www.skyhighairlines.com','500 Airport Blvd','Miami','FL','33132','(305) 555-0200','support@skyhighairlines.com','active'),
('FitZone Gym','fitzone-gym','Physical fitness and gym services.','www.fitzone.com','101 Fitness Street','Denver','CO','80204','(303) 555-0211','info@fitzone.com','active'),
('FunTime Entertainment','funtime-entertainment','Movies, amusement parks, theaters, and live shows.','www.funtime.com','88 Leisure Ave','Chicago','IL','60611','(312) 555-0222','contact@funtime.com','active');

-- Business Insurance (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Secure Commercial Property','secure-commercial-property','Insurance coverage for commercial buildings.','www.secureproperty.com','101 Insurance Blvd','Los Angeles','CA','90012','(323) 555-0178','info@secureproperty.com','active'),
('Liability Shield','liability-shield','Business liability insurance solutions.','www.liabilityshield.com','88 Protection St','Denver','CO','80204','(303) 555-0189','contact@liabilityshield.com','active'),
('WorkersComp Experts','workerscomp-experts','Workers compensation insurance services.','www.workerscompexperts.com','55 Safety Rd','Miami','FL','33132','(305) 555-0190','support@workerscompexperts.com','active'),
('Group Health Solutions','group-health-solutions','Health insurance plans for employees.','www.grouphealth.com','200 Wellness Lane','Chicago','IL','60611','(312) 555-0201','info@grouphealth.com','active');

-- Corporate Legal (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('CorporateLaw Partners','corporatelaw-partners','Legal services for corporate entities.','www.corporatelaw.com','120 Legal Ave','New York','NY','10005','(212) 555-0212','info@corporatelaw.com','active'),
('IP Protectors','ip-protectors','Patent, trademark, and IP legal services.','www.ipprotectors.com','88 Patent St','Boston','MA','02110','(617) 555-0223','contact@ipprotectors.com','active'),
('ContractLitigation Group','contractlitigation-group','Legal representation in contract disputes.','www.contractlitigation.com','55 Legal Blvd','Chicago','IL','60606','(312) 555-0234','info@contractlitigation.com','active'),
('Compliance Advisors','compliance-advisors','Business regulatory compliance consulting.','www.complianceadvisors.com','200 Regulation Lane','Miami','FL','33132','(305) 555-0245','support@complianceadvisors.com','active'),
('M&A Solutions','m-and-a-solutions','Advisory services for mergers and acquisitions.','www.masolutions.com','321 Merger St','New York','NY','10005','(212) 555-0256','contact@masolutions.com','active');

-- Business Consulting (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Top Management Consultants','top-management-consultants','Operational efficiency consulting for businesses.','www.topmanagement.com','120 Strategy Blvd','Boston','MA','02110','(617) 555-0267','info@topmanagement.com','active'),
('Strategic Edge','strategic-edge','Business strategy planning and execution services.','www.strategicedge.com','88 Market Lane','Chicago','IL','60606','(312) 555-0278','contact@strategicedge.com','active'),
('IT Insight Consulting','it-insight-consulting','IT consulting services for corporate clients.','www.itinsight.com','55 Tech Ave','New York','NY','10005','(212) 555-0289','support@itinsight.com','active'),
('HR Solutions','hr-solutions','Human resources and personnel management consulting.','www.hrsolutions.com','200 People Street','Miami','FL','33132','(305) 555-0300','info@hrsolutions.com','active'),
('RiskGuard Advisory','riskguard-advisory','Enterprise risk analysis and mitigation services.','www.riskguard.com','321 Risk Blvd','Denver','CO','80204','(303) 555-0311','contact@riskguard.com','active');

-- IT Services (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Managed IT Pros','managed-it-pros','Managed IT and system administration services.','www.manageditpros.com','101 Tech Lane','San Francisco','CA','94104','(415) 555-0322','support@manageditpros.com','active'),
('Helpdesk Heroes','helpdesk-heroes','Technical support and helpdesk services.','www.helpdeskheroes.com','88 Support St','Austin','TX','78701','(512) 555-0333','info@helpdeskheroes.com','active'),
('CloudWorks','cloudworks','Cloud infrastructure management and consulting.','www.cloudworks.com','55 Cloud Ave','Miami','FL','33132','(305) 555-0344','contact@cloudworks.com','active'),
('CyberShield','cybershield','Corporate cybersecurity services.','www.cybershield.com','200 Security Blvd','Denver','CO','80204','(303) 555-0355','support@cybershield.com','active');

-- Software Development (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('WebApps Co.','webapps-co','Custom web application development.','www.webappsco.com','321 Web Street','Chicago','IL','60611','(312) 555-0366','info@webappsco.com','active'),
('AppMakers','appmakers','Mobile app development services.','www.appmakers.com','88 Mobile Blvd','Boston','MA','02110','(617) 555-0377','contact@appmakers.com','active'),
('Enterprise Solutions Inc.','enterprise-solutions-inc','Enterprise software development for large corporations.','www.enterprisesolutions.com','55 Enterprise St','New York','NY','10005','(212) 555-0388','support@enterprisesolutions.com','active'),
('DataIntel Analytics','dataintel-analytics','Business intelligence and analytics solutions.','www.datainteel.com','120 Data Rd','San Francisco','CA','94104','(415) 555-0399','info@datainteel.com','active');

-- Real Estate & Construction (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('LeasePro Commercial','leasepro-commercial','Commercial property leasing and rental services.','www.leasepro.com','101 Property Ave','New York','NY','10005','(212) 555-0400','info@leasepro.com','active'),
('PropManage Solutions','propmanage-solutions','Management services for commercial and residential properties.','www.propmanage.com','88 Realty Lane','Chicago','IL','60606','(312) 555-0411','contact@propmanage.com','active'),
('Civic Builders','civic-builders','Civil construction and infrastructure projects.','www.civicbuilders.com','55 Construction Rd','Denver','CO','80204','(303) 555-0422','support@civicbuilders.com','active'),
('HighRise Constructors','highrise-constructors','Construction of high-rise commercial buildings.','www.highriseconstructors.com','200 Tower Blvd','Miami','FL','33132','(305) 555-0433','info@highriseconstructors.com','active'),
('Industrial Complex Co.','industrial-complex-co','Construction and management of industrial complexes.','www.industrialcomplex.com','321 Factory St','Houston','TX','77002','(713) 555-0444','contact@industrialcomplex.com','active');

-- Industrial Services (3)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('WeldTech','weldtech','Structural, pipeline, and micro welding services.','www.weldtech.com','55 Metal St','Houston','TX','77002','(713) 555-0511','info@weldtech.com','active'),
('Machinex','machinex','Metal machining and fabrication services.','www.machinex.com','200 Industrial Blvd','Chicago','IL','60606','(312) 555-0522','contact@machinex.com','active'),
('CNC Precision','cnc-precision','Precision CNC milling and metal cutting services.','www.cncprecision.com','321 Milling Lane','San Francisco','CA','94104','(415) 555-0533','info@cncprecision.com','active');

-- Marketing & PR (4)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Creative Ads Agency','creative-ads-agency','Advertising and creative marketing services.','www.creativeads.com','120 Marketing Blvd','New York','NY','10005','(212) 555-0544','info@creativeads.com','active'),
('PR Connect','pr-connect','Public relations and media management services.','www.prconnect.com','88 Media Lane','Chicago','IL','60606','(312) 555-0555','contact@prconnect.com','active'),
('MarketVision','marketvision','Market research, surveys, and analytics services.','www.marketvision.com','55 Research Rd','Denver','CO','80204','(303) 555-0566','info@marketvision.com','active'),
('LinguaLocal','lingualocal','Language translation and localization services.','www.lingualocal.com','200 Translation Blvd','Miami','FL','33132','(305) 555-0577','support@lingualocal.com','active');

-- Business Support Services (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Notary Express','notary-express','Business notary and document certification services.','www.notaryexpress.com','101 Sign St','New York','NY','10005','(212) 555-0588','info@notaryexpress.com','active'),
('Virtual Assist Co.','virtual-assist-co','Remote administrative and virtual assistant services.','www.virtualassistco.com','88 Remote Ln','Chicago','IL','60606','(312) 555-0599','contact@virtualassistco.com','active'),
('CallConnect Solutions','callconnect-solutions','Business call center and customer support services.','www.callconnect.com','55 Support Blvd','Denver','CO','80204','(303) 555-0600','info@callconnect.com','active'),
('Payroll Experts','payroll-experts','Corporate payroll processing services.','www.payrollexperts.com','200 Pay Lane','Miami','FL','33132','(305) 555-0611','support@payrollexperts.com','active'),
('Event Travel Co.','event-travel-co','Corporate event planning and travel management.','www.eventtravel.com','321 Event St','New York','NY','10005','(212) 555-0622','contact@eventtravel.com','active');

-- Research & Development (5)
INSERT INTO companies (name, slug, description, website, address_line1, city, state, zip_code, phone, email, status)
VALUES
('Clinical Trials Inc.','clinical-trials-inc','Clinical research and trial management services.','www.clinicaltrials.com','120 Research Blvd','Boston','MA','02110','(617) 555-0633','info@clinicaltrials.com','active'),
('GeneSeq Labs','geneseq-labs','Genetic sequencing and analysis services.','www.geneseq.com','88 Genome Lane','San Francisco','CA','94104','(415) 555-0644','support@geneseq.com','active'),
('Material Science Co.','material-science-co','Research and development in materials science.','www.materialscience.com','55 Innovation Rd','Chicago','IL','60606','(312) 555-0655','info@materialscience.com','active'),
('NanoTech Research','nanotech-research','Research and applications in nanotechnology.','www.nanotech.com','200 Nano Blvd','Boston','MA','02110','(617) 555-0666','contact@nanotech.com','active'),
('Nuclear Physics Labs','nuclear-physics-labs','Research and consulting in nuclear physics.','www.nuclearphysics.com','321 Atomic Ave','Denver','CO','80204','(303) 555-0677','support@nuclearphysics.com','active');

-- Verification query (should return 115)
SELECT COUNT(*) as total_companies FROM companies;