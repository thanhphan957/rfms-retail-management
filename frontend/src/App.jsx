import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import {
  LayoutDashboard, Package, Users, ShoppingCart, Tags, Plus,
  Pencil, Trash2, Search, RefreshCw, Boxes, AlertTriangle
} from "lucide-react";

const money = (n) => new Intl.NumberFormat("vi-VN", {
  style: "currency", currency: "VND", maximumFractionDigits: 0
}).format(n || 0);

function App() {
  const [page, setPage] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showProduct, setShowProduct] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const [d, p, c, cu, o] = await Promise.all([
      api.get("/dashboard"), api.get("/products"), api.get("/categories"),
      api.get("/customers"), api.get("/orders")
    ]);
    setDashboard(d.data); setProducts(p.data); setCategories(c.data);
    setCustomers(cu.data); setOrders(o.data);
  };

  useEffect(() => { load().catch(e => setNotice(e.response?.data?.message || e.message)); }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  const saveProduct = async (form) => {
    try {
      if (editing) await api.put(`/products/${editing._id}`, form);
      else await api.post("/products", form);
      setShowProduct(false); setEditing(null); setNotice("Đã lưu sản phẩm."); await load();
    } catch (e) { setNotice(e.response?.data?.message || e.message); }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try { await api.delete(`/products/${id}`); setNotice("Đã xóa sản phẩm."); await load(); }
    catch (e) { setNotice(e.response?.data?.message || e.message); }
  };

  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["products", "Sản phẩm", Package],
    ["categories", "Danh mục", Tags],
    ["customers", "Khách hàng", Users],
    ["orders", "Đơn hàng", ShoppingCart]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><Boxes size={28}/><div><b>RetailPro</b><span>Quản lý bán lẻ</span></div></div>
        <nav>{nav.map(([id, label, Icon]) =>
          <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
            <Icon size={19}/>{label}
          </button>
        )}</nav>
        <div className="side-foot">MongoDB • Node.js • React</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><h1>{nav.find(x => x[0] === page)?.[1] || "Dashboard"}</h1><p>Hệ thống quản lý bán lẻ</p></div>
          <button className="icon-btn" onClick={() => load()} title="Làm mới"><RefreshCw size={19}/></button>
        </header>

        {notice && <div className="notice" onClick={() => setNotice("")}>{notice}</div>}

        {page === "dashboard" && <Dashboard data={dashboard} products={products} />}
        {page === "products" && <section className="panel">
          <div className="panel-head">
            <div className="search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm hoặc SKU..." /></div>
            <button className="primary" onClick={() => {setEditing(null); setShowProduct(true)}}><Plus size={18}/> Thêm sản phẩm</button>
          </div>
          <ProductTable products={filteredProducts} onEdit={(p) => {setEditing(p);setShowProduct(true)}} onDelete={deleteProduct}/>
        </section>}
        {page === "categories" && <SimpleList title="Danh mục" items={categories} fields={["name","description"]}/>}
        {page === "customers" && <SimpleList title="Khách hàng" items={customers} fields={["name","phone","email","address"]}/>}
        {page === "orders" && <OrderList orders={orders}/>}
      </main>

      {showProduct && <ProductModal initial={editing} categories={categories} onClose={() => {setShowProduct(false);setEditing(null)}} onSave={saveProduct}/>}
    </div>
  );
}

function Dashboard({data, products}) {
  if (!data) return <div className="loading">Đang tải dữ liệu...</div>;
  return <div>
    <div className="cards">
      <Stat title="Tổng sản phẩm" value={data.productCount} icon={<Package/>}/>
      <Stat title="Khách hàng" value={data.customerCount} icon={<Users/>}/>
      <Stat title="Đơn hàng" value={data.orderCount} icon={<ShoppingCart/>}/>
      <Stat title="Doanh thu" value={money(data.revenue)} icon={<span className="money">₫</span>}/>
    </div>
    <div className="grid-two">
      <section className="panel">
        <div className="panel-title"><h2>Sản phẩm sắp hết</h2><AlertTriangle size={19}/></div>
        {data.lowStock.length ? data.lowStock.map(p => <div className="low-row" key={p._id}><span>{p.name}</span><b>{p.stock}</b></div>) : <p className="muted">Chưa có sản phẩm sắp hết.</p>}
      </section>
      <section className="panel">
        <div className="panel-title"><h2>Tình trạng kho</h2><Boxes size={19}/></div>
        <div className="stock-big">{products.reduce((s,p)=>s+p.stock,0)}</div>
        <p className="muted">Tổng số lượng sản phẩm đang tồn</p>
      </section>
    </div>
  </div>;
}

function Stat({title,value,icon}) {
  return <div className="stat"><div><span>{title}</span><strong>{value}</strong></div><div className="stat-icon">{icon}</div></div>;
}

function ProductTable({products,onEdit,onDelete}) {
  return <div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>SKU</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th></th></tr></thead>
  <tbody>{products.map(p => <tr key={p._id}><td><b>{p.name}</b><small>{p.unit}</small></td><td>{p.sku}</td><td>{p.category?.name || "Chưa phân loại"}</td><td>{money(p.price)}</td><td><span className={p.stock <= 5 ? "badge danger" : "badge"}>{p.stock}</span></td><td className="actions"><button onClick={()=>onEdit(p)}><Pencil size={16}/></button><button onClick={()=>onDelete(p._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table>
  {!products.length && <div className="empty">Chưa có sản phẩm.</div>}</div>;
}

function SimpleList({title,items,fields}) {
  return <section className="panel"><div className="panel-title"><h2>{title}</h2><span className="muted">{items.length} bản ghi</span></div>
    <div className="table-wrap"><table><thead><tr>{fields.map(f=><th key={f}>{f}</th>)}</tr></thead><tbody>
      {items.map(x=><tr key={x._id}>{fields.map(f=><td key={f}>{x[f] || "—"}</td>)}</tr>)}
    </tbody></table>{!items.length&&<div className="empty">Chưa có dữ liệu.</div>}</div>
  </section>;
}

function OrderList({orders}) {
  return <section className="panel"><div className="panel-title"><h2>Đơn hàng</h2><span className="muted">{orders.length} đơn</span></div>
    <div className="table-wrap"><table><thead><tr><th>Mã</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày</th></tr></thead>
    <tbody>{orders.map(o=><tr key={o._id}><td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.customer?.name || "Khách lẻ"}</td><td>{o.items.length}</td><td>{money(o.total)}</td><td><span className="badge">{o.status === "completed" ? "Hoàn tất" : "Đã hủy"}</span></td><td>{new Date(o.createdAt).toLocaleString("vi-VN")}</td></tr>)}</tbody></table>
    {!orders.length&&<div className="empty">Chưa có đơn hàng.</div>}</div>
  </section>;
}

function ProductModal({initial,categories,onClose,onSave}) {
  const [form,setForm]=useState({
    name: initial?.name || "", sku: initial?.sku || "", category: initial?.category?._id || initial?.category || "",
    price: initial?.price || 0, stock: initial?.stock || 0, unit: initial?.unit || "sản phẩm",
    description: initial?.description || ""
  });
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));
  return <div className="modal-backdrop"><form className="modal" onSubmit={e=>{e.preventDefault();onSave({...form,price:Number(form.price),stock:Number(form.stock)})}}>
    <div className="modal-head"><h2>{initial?"Sửa sản phẩm":"Thêm sản phẩm"}</h2><button type="button" onClick={onClose}>×</button></div>
    <label>Tên sản phẩm<input required value={form.name} onChange={e=>set("name",e.target.value)}/></label>
    <label>SKU<input required value={form.sku} onChange={e=>set("sku",e.target.value)}/></label>
    <div className="form-grid"><label>Giá bán<input type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)}/></label><label>Tồn kho<input type="number" min="0" value={form.stock} onChange={e=>set("stock",e.target.value)}/></label></div>
    <label>Danh mục<select value={form.category} onChange={e=>set("category",e.target.value)}><option value="">Chưa phân loại</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
    <label>Đơn vị<input value={form.unit} onChange={e=>set("unit",e.target.value)}/></label>
    <label>Mô tả<textarea value={form.description} onChange={e=>set("description",e.target.value)}/></label>
    <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Hủy</button><button className="primary" type="submit">Lưu sản phẩm</button></div>
  </form></div>;
}

export default App;
