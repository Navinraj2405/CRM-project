const cashfreeModule = require('cashfree-pg');
console.log(Object.keys(cashfreeModule));
console.log(cashfreeModule.Cashfree ? Object.keys(cashfreeModule.Cashfree) : 'No Cashfree config natively');
