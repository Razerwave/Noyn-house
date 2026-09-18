import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";
import { getDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

function dateLabel(value: string) {
	return value ? new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeZone: "Asia/Ulaanbaatar" }).format(new Date(value)) : "—";
}
 export default async function Admin() {
	 const context = await getAdminContext(["Admin", "Sales", "Content Editor"]);
	 if (!context) redirect("/admin/login");
	 const dashboard = await getDashboardData();
	 return (
		 <div className="admin-body">
			 <AdminShell role={context.roleName}>
				 <div className="admin-top">
					 <div>
						 <h1>Хянах самбар</h1>
						 <small>Өнөөдрийн бодит хүсэлт, ажлын төлөв</small>
					 </div>
					 <span>{context.roleName}</span>
				 </div>
				 <div className="metric-grid">
					 <div className="metric">
						 <span>НИЙТ ХҮСЭЛТ</span>
						 <strong>{dashboard.total}</strong>
					 </div>
					 <div className="metric">
						 <span>ШИНЭ ХҮСЭЛТ</span>
						 <strong>{dashboard.newCount}</strong>
					 </div>
					 <div className="metric">
						 <span>ХОЛБОГДООГҮЙ</span>
						 <strong>{dashboard.uncontacted}</strong>
					 </div>
					 <div className="metric">
						 <span>ЭНЭ САРЫН ХҮСЭЛТ</span>
						 <strong>{dashboard.month}</strong>
					 </div>
				 </div>
				 <div className="admin-card">
					 <h2>Сүүлийн хүсэлтүүд</h2>
					 {dashboard.recent.length ? (
						 <table className="admin-table">
							 <thead>
								 <tr>
									 <th>Дугаар</th>
									 <th>Огноо</th>
									 <th>Харилцагч</th>
									 <th>Загвар</th>
									 <th>Байршил</th>
									 <th>Төлөв</th>
								 </tr>
							 </thead>
							 <tbody>
								 {dashboard.recent.map(row => (
									 <tr key={row.enquiryNumber}>
										 <td>{row.enquiryNumber}</td>
										 <td>{dateLabel(row.createdAt)}</td>
										 <td>{row.customerName}</td>
										 <td>{row.model || "Сонгоогүй"}</td>
										 <td>{row.location}</td>
										 <td>
											 <span className={`status ${row.status === "Шинэ" ? "draft" : ""}`}>
												 {row.status}
											 </span>
										 </td>
									 </tr>
								 ))}
							 </tbody>
						 </table>
					 ) : (
						 <div className="admin-empty">
							 <strong>Хүсэлт одоогоор алга</strong>
							 <span>Public form-оор ирсэн хүсэлтүүд энд харагдана.</span>
						 </div>
					 )}
				 </div>
				 <div className="admin-card">
					 <h2>Өнөөдрийн хүсэлт</h2>
					 <p className="section-copy">Өнөөдөр {dashboard.today} шинэ хүсэлт бүртгэгдсэн байна.</p>
				 </div>
			 </AdminShell>
		 </div>
	 );
 }
