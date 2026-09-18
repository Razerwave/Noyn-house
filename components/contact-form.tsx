"use client";
import { toast } from "sonner";

export function ContactForm(){return <form className="form-card" onSubmit={e=>{e.preventDefault();e.currentTarget.reset();toast.success("Таны зурвасыг хүлээн авлаа.")}}><h2>Бидэнд зурвас үлдээнэ үү</h2><div className="field-grid"><div className="field"><label>Нэр</label><input required placeholder="Таны нэр"/></div><div className="field"><label>Утас</label><input required placeholder="+976"/></div><div className="field full"><label>Имэйл</label><input type="email" placeholder="name@example.com"/></div><div className="field full"><label>Зурвас</label><textarea rows={5} placeholder="Танд ямар мэдээлэл хэрэгтэй вэ?"/></div><div className="field full"><button className="button">Зурвас илгээх</button></div></div></form>}
