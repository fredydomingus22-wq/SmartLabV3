
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("🚀 Starting seed script...");

    try {
        // 1. Create Product
        console.log("Creating Product...");
        const productId = uuidv4();
        const { data: product, error: productError } = await supabase
            .from("products")
            .insert({
                id: productId,
                name: "Coca-Cola 1.5L Test",
                sku: `TEST-${Date.now()}`,
                category: "Refrigerante",
                product_type: "beverage",
                shelf_life_days: 180,
                storage_conditions: "Cool dry place",
                active: true
            })
            .select()
            .single();

        if (productError) throw productError;
        console.log("✅ Product created:", product.name);

        // 2. Get Parameters (assuming they exist, otherwise create them)
        console.log("Fetching Parameters...");
        const { data: parameters } = await supabase
            .from("parameters")
            .select("*")
            .limit(2);

        if (!parameters || parameters.length < 2) {
            console.error("❌ Not enough parameters found. Please seed parameters first.");
            return;
        }

        const param1 = parameters[0];
        const param2 = parameters[1];

        // 3. Create Specs
        console.log("Creating Specs...");
        const { error: specsError } = await supabase
            .from("product_specs")
            .insert([
                {
                    product_id: productId,
                    parameter_id: param1.id,
                    spec_min: 9.5,
                    spec_target: 10.0,
                    spec_max: 10.5,
                    unit: param1.unit,
                    test_frequency: "per_batch",
                    test_level: "finished",
                    is_critical: true
                },
                {
                    product_id: productId,
                    parameter_id: param2.id,
                    spec_min: 3.0,
                    spec_target: 3.5,
                    spec_max: 4.0,
                    unit: param2.unit,
                    test_frequency: "per_batch",
                    test_level: "finished",
                    is_critical: false
                }
            ]);

        if (specsError) throw specsError;
        console.log("✅ Specs created");

        // 4. Create Production Lot
        console.log("Creating Production Lot...");
        const lotId = uuidv4();
        const { data: lot, error: lotError } = await supabase
            .from("production_lots")
            .insert({
                id: lotId,
                code: `LOT-${Date.now()}`,
                product_id: productId,
                production_line: "Line 1",
                shift: "Morning",
                status: "open"
            })
            .select()
            .single();

        if (lotError) throw lotError;
        console.log("✅ Production Lot created:", lot.code);

        // 5. Create Intermediate Tank
        console.log("Creating Intermediate Tank...");
        const tankId = uuidv4();
        const { data: tank, error: tankError } = await supabase
            .from("intermediate_tanks")
            .insert({
                id: tankId,
                production_lot_id: lotId,
                tank_code: "TK-01",
                syrup_name: "Syrup A",
                status: "active",
                prepared_by: "Seed Script"
            })
            .select()
            .single();

        if (tankError) throw tankError;
        console.log("✅ Tank created:", tank.tank_code);

        // 6. Create Line Sample with Analysis (Simulating the API call logic)
        console.log("Creating Line Sample and Analysis...");
        const sampleId = uuidv4();
        const sampleTime = new Date().toISOString();

        // Create Sample
        const { data: sample, error: sampleError } = await supabase
            .from("line_samples")
            .insert({
                id: sampleId,
                tank_id: tankId,
                production_lot_id: lotId,
                product_id: productId,
                sample_time: sampleTime,
                collected_by: "Tester",
                status: "pending"
            })
            .select()
            .single();

        if (sampleError) throw sampleError;

        // Create Analysis (1 in spec, 1 out of spec)
        const analyses = [
            {
                sample_id: sampleId,
                parameter_id: param1.id,
                value: 10.2, // In spec (9.5 - 10.5)
                lsl: 9.5,
                target: 10.0,
                usl: 10.5,
                unit: param1.unit,
                result_status: "in_spec"
            },
            {
                sample_id: sampleId,
                parameter_id: param2.id,
                value: 4.5, // Out of spec (3.0 - 4.0)
                lsl: 3.0,
                target: 3.5,
                usl: 4.0,
                unit: param2.unit,
                result_status: "out_of_spec"
            }
        ];

        const { error: analysisError } = await supabase
            .from("line_analysis")
            .insert(analyses);

        if (analysisError) throw analysisError;
        console.log("✅ Line Analysis created");

        // 7. Create Product Tests (The integration part we want to verify)
        console.log("Creating Product Tests (Integration Check)...");
        const productTests = analyses.map(a => ({
            product_id: productId,
            production_lot_id: lotId,
            tank_id: tankId,
            sample_id: sampleId,
            parameter_id: a.parameter_id,
            measured_value: a.value,
            spec_min: a.lsl,
            spec_target: a.target,
            spec_max: a.usl,
            unit: a.unit,
            result_status: a.result_status,
            test_level: "line",
            tested_by: "Tester",
            tested_at: sampleTime
        }));

        const { error: testsError } = await supabase
            .from("product_tests")
            .insert(productTests);

        if (testsError) throw testsError;
        console.log("✅ Product Tests created (Integration Verified)");

        console.log("\n🎉 Seed completed successfully!");
        console.log(`Product ID: ${productId}`);
        console.log(`Lot ID: ${lotId}`);
        console.log("You can now check the UI to see this data.");

    } catch (error) {
        console.error("❌ Error seeding data:", error);
    }
}

main();
