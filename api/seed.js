// Run: node api/seed.js
// Seeds the database with initial product data

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, Api, Intermediate, Pellet } = require('./db');

const apis = [
  "Acebrophylline","Aceclofenac","Albendazole","Allopurinol","Ambroxol HCL","Amlodipine Besylate",
  "Amodiaquine HCL","Aprepitant","Artemether","Atenolol","Atorvastatin Calcium","Bisoprolol Fumarate",
  "Bromhexine Hcl","Cefixime Trihydrate","Cetirizine Hcl","Chloroquine Phosphate","Chlorpheniramine Maleate",
  "Cimetidine","Dapoxetine","Dapsone","Dextromethorphan HBR","Diclofenac Potassium","Diclofenac Sodium",
  "Diphenhydramine","Domperidone","Domperidone Maleate","Doxofylline","Erythromycin","Esomeprazole Magnesium Trihydrate",
  "Famotidine","Fluconazole","Flumequine","Fosaprepitant Dimeglumine","Fosphenytoin Sodium","Furosemide",
  "Gabapentin","Gliclazide","Guaifenesin","Hydrochlorothiazide","Hydroxychloroquine Sulphate","Hydroxyzine Hcl",
  "Ibuprofen","Irbesartan","Itraconazole","Ketoconazole","Ketoprofen","Ketorolac Tromethamine",
  "Levocetirizine","Lidocaine Base/HCL","Loperamide Hcl","Loratadine","Losartan Potassium","Lumefantrine",
  "Metformin Hcl","Metoclopramide","Minoxidil","Mirtazapine","Naproxen","Nicardipine HCl",
  "Nimesulide","Olmesartan","Omeprazole","Pantoprazole","Paracetamol","Phenylephrine Hcl",
  "Piperaquine Phosphate","Povidone Iodine","Pregabalin","Primaquine Phosphate","Pyrimethamine","Ranitidine Hcl",
  "Ropivacaine Hcl","Rosuvastatin Calcium","Salbutamol Sulphate","Sibutramine","Sildenafil Citrate","Silver Sulfadiazine",
  "Sulfadoxine","Sulfamethoxazole","Tadalafil","Telmisartan","Tiagabine HCL","Torsemide",
  "Trazodone HCL","Trimethoprim","Valsartan","Vardenafil HCL"
];

const intermediates = [
  { group: "Ranitidine HCl Intermediates", name: "2-[[[5-(Dimethylamino) methyl-1,2-furanyl] methyl] thio] ethanamine", cas: "66356-53-4" },
  { group: "Ranitidine HCl Intermediates", name: "2-((5-((Dimethylamino)methyl)furan-2-yl)methylthio)ethanamine", cas: "66356-53-4" },
  { group: "Ranitidine HCl Intermediates", name: "N-Methyl-1-(methylthio)-2-nitroethenamine", cas: "61832-41-5" },
  { group: "Ranitidine HCl Intermediates", name: "N-[2-[[[5-(Dimethylamino) methyl] furan-2-yl] methyl] thio] ethyl]-N-methyl-2-nitroethene-1,1-diamine", cas: "66357-35-5" },
  { group: "Famotidine Intermediates", name: "2-[4-(Chloromethyl) thiazol-2-yl] guanidine hydrochloride", cas: "69014-12-6" },
  { group: "Famotidine Intermediates", name: "N-[4-[[(Amino iminomethyl) thio]-methyl]-2-thiazolyl]-guanidine dihydrochloride", cas: "88046-01-9" },
  { group: "Famotidine Intermediates", name: "Sulfuric diamide", cas: "7803-58-9" },
  { group: "Famotidine Intermediates", name: "N-Sulfamyl-3-chloro propionamidine HCl", cas: "106649-95-0" },
  { group: "Famotidine Intermediates", name: "Aminoiminoethyl thiourea", cas: "2114-02-05" },
  { group: "Mirtazapine Intermediates", name: "Isopropyl 2-chloronicotinate", cas: "NA" },
  { group: "Mirtazapine Intermediates", name: "(2-(4-Methyl-2-phenylpiperazin-1-yl)pyridin-3-yl)methanol", cas: "61337-89-1" },
  { group: "Mirtazapine Intermediates", name: "1-Methyl-3-phenylpiperazine", cas: "5271-27-2" },
  { group: "Rizatriptan Intermediates", name: "1-(4-Nitrophenyl)methyl-1,2,4-triazole", cas: "119192-09-5" },
  { group: "Rizatriptan Intermediates", name: "4-(1H-1,2,4-Triazol-1-ylmethyl)aniline", cas: "119192-10-8" },
  { group: "Eletriptan HBr Intermediates", name: "(3-[(R)-1-(Benzyloxy) carbonyl pyrrolidine-2-carbonyl)-5-bromoindole", cas: "143322-56-9" },
  { group: "Eletriptan HBr Intermediates", name: "5-Bromo-3-(((R)-1-methylpyrrolidin-2-yl) methyl)-1H-indole", cas: "143322-57-0" },
  { group: "Eletriptan HBr Intermediates", name: "Phenyl vinyl sulfone", cas: "5535-48-8" }
];

const pellets = [
  { product: "Atorvastatin Pellets", percentage: "10%, 15%, 20%" },
  { product: "Ascorbic Acid Pellets", percentage: "70%" },
  { product: "Aspirin Pellets", percentage: "60%" },
  { product: "Carbonyl Iron Pellets", percentage: "35%, 50%, 70%" },
  { product: "Chloroquine Phosphate 250mg Pellets", percentage: "25%" },
  { product: "Chlorpheniramine Maleate Pellets", percentage: "2%, 5%" },
  { product: "Diclofenac Sodium Pellets (SR)", percentage: "40%" },
  { product: "Domperidone Pellets", percentage: "10%, 17%, 20%, 22%, 22.5%, 25%, 30%, 35%, 40%" },
  { product: "Duloxetine Hcl Pellets", percentage: "17%" },
  { product: "Esomeprazole + Domperidone (SR)", percentage: "20 mg + 30 mg" },
  { product: "Esomeprazole + Domperidone (SR)", percentage: "40 mg + 30 mg" },
  { product: "Esomeprazole + Itopride Hcl (SR)", percentage: "40 mg + 150 mg" },
  { product: "Esomeprazole + Levosulpiride (SR)", percentage: "40 mg + 75 mg" },
  { product: "Esomeprazole Pellets", percentage: "7.5%, 8.5%, 15%, 22.5%, 25%" },
  { product: "Folic Acid Pellets", percentage: "1%, 3%, 5%" },
  { product: "Indomethacin Pellets (SR)", percentage: "30%" },
  { product: "Itopride HCL Pellets (SR)", percentage: "50%, 75%" },
  { product: "Itraconazole Pellets", percentage: "20%, 22%, 40%, 44%" },
  { product: "Lansoprazole Pellets", percentage: "8.5%, 11%, 15%" },
  { product: "Levosulpiride SR Pellets", percentage: "35%, 50%, 55%, 65%, 70%" },
  { product: "Mebeverine Hcl Pellets SR", percentage: "50%, 60%, 80%" },
  { product: "Omeprazole + Domperidone (IR)", percentage: "20 mg + 10 mg" },
  { product: "Omeprazole + Domperidone (SR)", percentage: "20 mg + 30 mg" },
  { product: "Omeprazole Pellets", percentage: "7.5%, 8.5%, 10%, 11.2%, 12.5%, 15%, 22.5%" },
  { product: "Pantoprazole + Cinitapride (SR)", percentage: "40 mg + 3 mg" },
  { product: "Pantoprazole + Levosulpiride (SR)", percentage: "40 mg + 75 mg" },
  { product: "Pantoprazole Pellets", percentage: "10%, 15%, 22%, 22.5%, 25%, 30%" },
  { product: "Pantoprazole + Domperidone (IR)", percentage: "20 mg + 10 mg" },
  { product: "Pantoprazole + Domperidone (SR & IR)", percentage: "40 mg + 20 mg + 10 mg" },
  { product: "Pantoprazole + Domperidone (SR)", percentage: "40 mg + 30 mg" },
  { product: "Pantoprazole + Itopride Hcl (SR)", percentage: "40 mg + 150 mg" },
  { product: "Phenylephrine Hcl Pellets", percentage: "3%, 10%" },
  { product: "Propranolol Hcl Pellets", percentage: "40 mg" },
  { product: "Pyridoxine Hydrochloride (B6) Pellets", percentage: "1.5%, 5%" },
  { product: "Rabeprazole Pellets", percentage: "7.5%, 8.5%, 11%, 15%, 20%" },
  { product: "Rabeprazole + Aceclofenac (SR)", percentage: "20 mg + 200 mg" },
  { product: "Rabeprazole + Diclofenac (SR)", percentage: "20 mg + 100 mg" },
  { product: "Rabeprazole + Domperidone (SR & IR)", percentage: "20 mg + 20 mg + 10 mg" },
  { product: "Rabeprazole + Domperidone (SR)", percentage: "20 mg + 30 mg" },
  { product: "Rabeprazole + Itopride Hcl (SR)", percentage: "20 mg + 150 mg" },
  { product: "Rabeprazole + Levosulpiride (SR)", percentage: "20 mg + 75 mg" },
  { product: "Rosuvastatin Pellets", percentage: "10%, 15%, 20%" },
  { product: "Selenium Pellets", percentage: "1%" },
  { product: "Tamsulosine Hydrochloride + Dutasteride", percentage: "0.4 mg + 0.5 mg" },
  { product: "Tamsulosin Hcl Pellets", percentage: "0.2%, 0.4%, 0.16%" },
  { product: "Vitamin B12 Pellets", percentage: "0.20%" },
  { product: "Zinc Sulphate Monohydrate", percentage: "35%, 50%, 70%" }
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Api.deleteMany({});
    await Intermediate.deleteMany({});
    await Pellet.deleteMany({});
    console.log('Cleared existing data');

    // Insert
    await Api.insertMany(apis.map(function (n) { return { name: n }; }));
    console.log('Inserted ' + apis.length + ' APIs');

    await Intermediate.insertMany(intermediates);
    console.log('Inserted ' + intermediates.length + ' Intermediates');

    await Pellet.insertMany(pellets);
    console.log('Inserted ' + pellets.length + ' Pellets');

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
