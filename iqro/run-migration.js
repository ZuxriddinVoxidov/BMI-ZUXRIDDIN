const https = require('https')

const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3d3Nid3Z2bGtxcXdiamVtd2h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc3NDAxNSwiZXhwIjoyMDg4MzUwMDE1fQ.wcj0yf5blz4ANnMLQVyd_18jAEeRmq1mFCG6my8MuRs'
const PROJECT_REF = 'hwwsbwvvlkqqwbjemwhz'

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': 'Bearer ' + SERVICE_ROLE,
      }
    }
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function main() {
  console.log('Running leaderboard migration...')

  // Step 1: Add weekly and monthly columns
  const r1 = await runSQL(`
    ALTER TABLE student_points 
    ADD COLUMN IF NOT EXISTS weekly_points INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS monthly_points INTEGER NOT NULL DEFAULT 0;
  `)
  console.log('Step 1 (add columns):', r1.status, r1.body.substring(0, 200))

  if (r1.status !== 200 && r1.status !== 201) {
    console.log('Failed. Trying direct pg access via Supabase REST...')
    return
  }

  // Step 2: Update the add_student_points function
  const r2 = await runSQL(`
    CREATE OR REPLACE FUNCTION add_student_points(p_student_id UUID, p_points INTEGER)
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN
      INSERT INTO student_points (student_id, total_points, weekly_points, monthly_points)
      VALUES (p_student_id, p_points, p_points, p_points)
      ON CONFLICT (student_id)
      DO UPDATE SET
        total_points   = student_points.total_points  + EXCLUDED.total_points,
        weekly_points  = student_points.weekly_points + EXCLUDED.weekly_points,
        monthly_points = student_points.monthly_points + EXCLUDED.monthly_points;
    END;
    $$;
  `)
  console.log('Step 2 (update RPC):', r2.status, r2.body.substring(0, 200))

  // Step 3: Enable realtime
  const r3 = await runSQL(`ALTER PUBLICATION supabase_realtime ADD TABLE student_points;`)
  console.log('Step 3 (realtime):', r3.status, r3.body.substring(0, 200))

  console.log('Migration done!')
}

main().catch(console.error)
