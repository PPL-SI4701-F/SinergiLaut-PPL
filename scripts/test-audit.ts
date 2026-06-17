import { getAdminAuditLog } from '../lib/actions/dashboard.actions'

async function test() {
  try {
    const res = await getAdminAuditLog()
    console.log(JSON.stringify(res, null, 2))
  } catch(e) {
    console.error(e)
  }
}

test()
