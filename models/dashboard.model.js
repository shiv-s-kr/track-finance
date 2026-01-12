const {db} = require("../utils/db");

// const getLiveDashboard = (user_id, callback) => {

//   try {
//     const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
//     // STEP 1: ✅ FIXED Summary Query - User-Specific
//     const summaryQuery = `
//       SELECT 
//         COALESCE((
//           SELECT SUM(amount) 
//           FROM income 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) as total_income,
//         COALESCE((
//           SELECT SUM(amount) 
//           FROM expenses 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) as total_expense,
//         COALESCE((
//           SELECT SUM(amount) 
//           FROM income 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) - COALESCE((
//           SELECT SUM(amount) 
//           FROM expenses 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) as balance
//     `;
    
//     db.query(summaryQuery, [user_id, user_id, user_id, user_id], (err, summaryResults) => {
//       const summary = (summaryResults && Array.isArray(summaryResults) && summaryResults[0]) 
//         ? summaryResults[0] 
//         : { total_income: 0, total_expense: 0, balance: 0 };

//       // STEP 2: Budget Alerts - Already User-Specific ✅
//       db.query(`
//         SELECT b.category, b.amount as budget, COALESCE(SUM(e.amount), 0) as spent,
//                ROUND((COALESCE(SUM(e.amount), 0) / b.amount * 100), 1) as percent
//         FROM budgets b 
//         LEFT JOIN expenses e ON b.category = e.category AND b.budget_month = ?
//         WHERE b.user_id = ? AND b.budget_month = ?
//         GROUP BY b.category, b.amount
//         HAVING percent > 90
//       `, [currentMonth, user_id, currentMonth], (err, alertResults) => {
//         const alerts = (alertResults && Array.isArray(alertResults)) ? alertResults : [];

//         // STEP 3: Expense Categories - Already User-Specific ✅
//         db.query(`
//           SELECT COALESCE(category, 'Others') as category, 
//                  COALESCE(SUM(amount), 0) as amount 
//           FROM expenses 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//           GROUP BY category 
//           ORDER BY amount DESC 
//           LIMIT 6
//         `, [user_id], (err, categoryResults) => {
//           const categories = (categoryResults && Array.isArray(categoryResults)) ? categoryResults : [];

//           // ✅ ALL DATA USER-SPECIFIC
//           callback(null, {
//             summary,
//             alerts,
//             categories,
//             user_id: parseInt(user_id)
//           });
//         });
//       });
//     });
    
//   } catch (error) {
//     console.error('Dashboard model error:', error);
//     callback(error, null);
//   }
// };

// const getLiveDashboard = (user_id, callback) => {
//   console.log("user_id in dashboard", user_id);
  
//   try {
//     const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
//     // STEP 1: Summary Query (unchanged ✅)
//     const summaryQuery = `
//       SELECT 
//         COALESCE((
//           SELECT SUM(amount) 
//           FROM income 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) as total_income,
//         COALESCE((
//           SELECT SUM(amount) 
//           FROM expenses 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) as total_expense,
//         COALESCE((
//           SELECT SUM(amount) 
//           FROM income 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) - COALESCE((
//           SELECT SUM(amount) 
//           FROM expenses 
//           WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//         ), 0) as balance
//     `;
    
//     db.query(summaryQuery, [user_id, user_id, user_id, user_id], (err, summaryResults) => {
//       const summary = (summaryResults && Array.isArray(summaryResults) && summaryResults[0]) 
//         ? summaryResults[0] 
//         : { total_income: 0, total_expense: 0, balance: 0 };

//       // STEP 2: Budget Alerts (unchanged ✅)
//       db.query(`
//         SELECT b.category, b.amount as budget, COALESCE(SUM(e.amount), 0) as spent,
//                ROUND((COALESCE(SUM(e.amount), 0) / b.amount * 100), 1) as percent
//         FROM budgets b 
//         LEFT JOIN expenses e ON b.category = e.category AND b.budget_month = ?
//         WHERE b.user_id = ? AND b.budget_month = ?
//         GROUP BY b.category, b.amount
//         HAVING percent > 90
//       `, [currentMonth, user_id, currentMonth], (err, alertResults) => {
//         const alerts = (alertResults && Array.isArray(alertResults)) ? alertResults : [];

//         // ✅ FIXED STEP 3: MONTHLY EXPENSES (Last 6 months) - SIMPLIFIED & WORKING
//          const monthlyExpensesQuery = `
//         SELECT 
//           YEAR(date) as year,
//           MONTH(date) as month_num,
//           DATE_FORMAT(date, '%Y-%m') as month,
//           DATE_FORMAT(date, '%b %Y') as month_name,
//           SUM(amount) as total_expense,
//           COUNT(*) as count
//         FROM expenses 
//         WHERE user_id = ?
//         GROUP BY YEAR(date), MONTH(date)
//         ORDER BY YEAR(date) DESC, MONTH(date) DESC
//         LIMIT 6
//       `;
        
//         db.query(monthlyExpensesQuery, [user_id], (err, monthlyResults) => {
//           console.log('Monthly query result:', monthlyResults); // DEBUG
//           const monthly_expenses = (monthlyResults && Array.isArray(monthlyResults)) ? monthlyResults : [];

//           // ✅ STEP 4: CATEGORY WISE EXPENSES (Current month)
//           const categoryExpensesQuery = `
//             SELECT 
//               COALESCE(category, 'Others') as category, 
//               COALESCE(SUM(amount), 0) as amount,
//               COUNT(*) as count,
//               CASE 
//                 WHEN (SELECT SUM(amount) FROM expenses WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())) > 0 THEN
//                   ROUND(SUM(amount) / (SELECT SUM(amount) FROM expenses WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())) * 100, 1)
//                 ELSE 0 
//               END as percent
//             FROM expenses 
//             WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE())
//             GROUP BY category 
//             ORDER BY amount DESC 
//             LIMIT 8
//           `;
          
//           db.query(categoryExpensesQuery, [user_id, user_id, user_id], (err, categoryResults) => {
//             const category_expenses = (categoryResults && Array.isArray(categoryResults)) ? categoryResults : [];

//             // ✅ COMPLETE DASHBOARD - MONTHLY DATA WILL SHOW
//             callback(null, {
//               summary,
//               alerts,
//               monthly_expenses,           // ✅ FIXED: Will show last 6 months
//               category_expenses,          // ✅ Current month categories
//               stats: {
//                 current_month: currentMonth,
//                 monthly_count: monthly_expenses.length
//               },
//               user_id: parseInt(user_id)
//             });
//           });
//         });
//       });
//     });
    
//   } catch (error) {
//     console.error('Dashboard model error:', error);
//     callback(error, null);
//   }
// };

const getLiveDashboard = (user_id, callback) => {
  try {
    const currentMonth = `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}`;

    // STEP 1: Summary
    const summaryQuery = `
      SELECT 
        COALESCE((
          SELECT SUM(amount) FROM income 
          WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        ), 0) AS total_income,
        COALESCE((
          SELECT SUM(amount) FROM expenses 
          WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        ), 0) AS total_expense,
        COALESCE((
          SELECT SUM(amount) FROM income 
          WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        ), 0) -
        COALESCE((
          SELECT SUM(amount) FROM expenses 
          WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        ), 0) AS balance
    `;

    db.query(summaryQuery, [user_id, user_id, user_id, user_id], (err, summaryResults) => {
      if (err) return callback(err);

      const summary = summaryResults?.[0] || {
        total_income: 0,
        total_expense: 0,
        balance: 0
      };

      // STEP 2: Budget Alerts
      db.query(
        `
        SELECT b.category, b.amount AS budget,
               COALESCE(SUM(e.amount), 0) AS spent,
               ROUND((COALESCE(SUM(e.amount), 0) / b.amount * 100), 1) AS percent
        FROM budgets b
        LEFT JOIN expenses e 
          ON b.category = e.category 
         AND DATE_FORMAT(e.date, '%Y-%m') = ?
        WHERE b.user_id = ? AND b.budget_month = ?
        GROUP BY b.category, b.amount
        HAVING percent > 90
        `,
        [currentMonth, user_id, currentMonth],
        (err, alertResults) => {
          if (err) return callback(err);

          const alerts = alertResults || [];

          // STEP 3: Top Categories (Current Month)
          db.query(
            `
            SELECT COALESCE(category, 'Others') AS category,
                   SUM(amount) AS amount
            FROM expenses
            WHERE user_id = ?
              AND MONTH(date) = MONTH(CURDATE())
              AND YEAR(date) = YEAR(CURDATE())
            GROUP BY category
            ORDER BY amount DESC
            LIMIT 6
            `,
            [user_id],
            (err, categoryResults) => {
              if (err) return callback(err);

              const categories = categoryResults || [];

              // STEP 4: Monthly Expenses (History)
              db.query(
                `
                SELECT DATE_FORMAT(date, '%Y-%m') AS month,
                       SUM(amount) AS amount
                FROM expenses
                WHERE user_id = ?
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month
                `,
                [user_id],
                (err, monthlyResults) => {
                  if (err) return callback(err);

                  const monthlyExpenses = monthlyResults || [];

                  // STEP 5: Category-wise Expenses (Current Month – Full)
                  db.query(
                    `
                    SELECT COALESCE(category, 'Others') AS category,
                           SUM(amount) AS amount
                    FROM expenses
                    WHERE user_id = ?
                      AND MONTH(date) = MONTH(CURDATE())
                      AND YEAR(date) = YEAR(CURDATE())
                    GROUP BY category
                    ORDER BY amount DESC
                    `,
                    [user_id],
                    (err, categoryWiseResults) => {
                      if (err) return callback(err);

                      callback(null, {
                        summary,
                        alerts,
                        categories,
                        monthlyExpenses,
                        categoryWiseExpenses: categoryWiseResults || [],
                        user_id: parseInt(user_id)
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Dashboard model error:', error);
    callback(error, null);
  }
};


module.exports = { getLiveDashboard };
