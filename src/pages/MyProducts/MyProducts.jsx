import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axios";
import { getMyProducts } from "./myProducts.helpers";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./myProducts.module.css";

function formatPrice(value) {
  if (value === undefined || value === null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductsMy() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const raw = localStorage.getItem("user");
      const userId = raw
        ? (JSON.parse(raw).user_id ?? JSON.parse(raw).id ?? null)
        : null;
      try {
        const catsResp = await api.get("/categories");
        if (!mounted) return;
        setCategories(catsResp.data || []);
        if (!userId) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const my = await getMyProducts(userId);
        if (!mounted) return;
        setProducts(my || []);
      } catch (err) {
        console.error("Failed loading products or categories", err);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getCategoryName = useCallback(
    (id) => {
      if (!id) return "—";
      const cat = categories.find((c) => Number(c.category_id) === Number(id));
      return cat ? cat.name : String(id);
    },
    [categories],
  );

  const sorted = useMemo(() => {
    const arr = Array.isArray(products) ? [...products] : [];
    const compare = (a, b) => {
      if (sortBy === "name")
        return (a.name || "")
          .toString()
          .localeCompare((b.name || "").toString(), "pt-BR", {
            sensitivity: "base",
          });
      if (sortBy === "status")
        return (a.status || "")
          .toString()
          .localeCompare((b.status || "").toString(), "pt-BR", {
            sensitivity: "base",
          });
      if (sortBy === "price")
        return (
          Number(a.price_per_day ?? a.price ?? 0) -
          Number(b.price_per_day ?? b.price ?? 0)
        );
      if (sortBy === "category")
        return getCategoryName(a.category_id).localeCompare(
          getCategoryName(b.category_id),
          "pt-BR",
          { sensitivity: "base" },
        );
      if (sortBy === "max_days")
        return (
          Number(a.max_days ?? a.maxDays ?? 0) -
          Number(b.max_days ?? b.maxDays ?? 0)
        );
      return 0;
    };
    arr.sort((a, b) => {
      const r = compare(a, b);
      return sortDir === "asc" ? r : -r;
    });
    return arr;
  }, [products, sortBy, sortDir, getCategoryName]);

  const startEdit = (product) => {
    setEditingId(product.product_id ?? product.id ?? null);
    setEditForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price_per_day: product.price_per_day ?? product.price ?? "",
      max_days: product.max_days ?? product.maxDays ?? "",
      status: product.status ?? "disponível",
      category_id: product.category_id ?? product.categoryId ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (product) => {
    const productId = product.product_id ?? product.id;
    if (!productId) return alert("ID do produto ausente");
    setSaving(true);
    try {
      const payload = {
        name: editForm.name,
        description: editForm.description,
        price_per_day: Number(String(editForm.price_per_day).replace(",", ".")),
        max_days: Number(editForm.max_days),
        status: editForm.status,
        category_id: Number(editForm.category_id),
      };
      await api.patch(`/products?product_id=eq.${productId}`, payload, {
        headers: { Prefer: "return=representation" },
      });
      const raw = localStorage.getItem("user");
      const userId = raw
        ? (JSON.parse(raw).user_id ?? JSON.parse(raw).id ?? null)
        : null;
      if (userId) {
        const fresh = await getMyProducts(userId);
        setProducts(fresh || []);
      }
      setEditingId(null);
      setEditForm({});
      alert("Produto atualizado com sucesso.");
    } catch (err) {
      console.error(
        "Erro ao atualizar produto",
        err.response?.data || err.message || err,
      );
      alert("Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.headerWrapper}>
          <Header />
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.title}>Meus Produtos</div>
              <div className={styles.subtitle}>Carregando...</div>
            </div>
          </div>
        </div>
        <main className={styles.main}>
          <div className={styles.loadingState}>Carregando produtos</div>
        </main>
        <div className={styles.footerWrapper}>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <Header />
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.title}>Meus Produtos</div>
            <div className={styles.subtitle}>
              Gerencie os produtos que você cadastrou
            </div>
          </div>

          <div className={styles.headerControls}>
            <div className={styles.controls}>
              <select
                className={styles.select}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Nome</option>
                <option value="status">Status</option>
                <option value="price">Preço</option>
                <option value="category">Categoria</option>
                <option value="max_days">Máx. dias</option>
              </select>
              <button
                className={styles.btn}
                onClick={() =>
                  setSortDir((s) => (s === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "Crescente" : "Decrescente"}
              </button>
            </div>
            <Link
              to="/product/up"
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              + Novo produto
            </Link>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        {sorted.length === 0 ? (
          <div className={styles.noItems}>
            <p>Nenhum produto cadastrado.</p>
            <Link to="/product/up" className={styles.emptyLink}>
              Cadastrar meu primeiro produto
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {sorted.map((p) => {
              const pid = p.product_id ?? p.id;
              return (
                <article key={pid} className={styles.card}>
                  <div className={styles.thumb}>
                    <img
                      src={
                        p.first_image_url ??
                        p.image ??
                        p.image_url ??
                        (p.images && p.images[0]?.image_url) ??
                        "https://via.placeholder.com/320x220?text=Sem+imagem"
                      }
                      alt={p.name}
                    />
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.name}>{p.name ?? "—"}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        {formatPrice(p.price_per_day ?? p.price)}
                      </span>
                      <span className={styles.pDay}>/dia</span>
                    </div>
                    <p className={styles.desc}>{p.description ?? "—"}</p>
                    <div className={styles.meta}>
                      <span className={styles.category}>
                        {getCategoryName(p.category_id)}
                      </span>
                      <span className={styles.small}>
                        <strong>Máx:</strong> {p.max_days ?? p.maxDays ?? "—"}{" "}
                        dias
                      </span>
                      <span className={styles.small}>
                        <strong>Status:</strong> {p.status ?? "—"}
                      </span>
                    </div>

                    {editingId === pid ? (
                      <div className={styles.editForm}>
                        <input
                          className={styles.input}
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((s) => ({ ...s, name: e.target.value }))
                          }
                          placeholder="Nome"
                        />
                        <textarea
                          className={styles.input}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Descrição"
                        />
                        <div className={styles.inputGroup}>
                          <input
                            className={styles.input}
                            value={editForm.price_per_day}
                            onChange={(e) =>
                              setEditForm((s) => ({
                                ...s,
                                price_per_day: e.target.value,
                              }))
                            }
                            placeholder="Preço"
                          />
                          <input
                            className={styles.input}
                            type="number"
                            value={editForm.max_days}
                            onChange={(e) =>
                              setEditForm((s) => ({
                                ...s,
                                max_days: e.target.value,
                              }))
                            }
                            placeholder="Máx. dias"
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <select
                            className={styles.input}
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm((s) => ({
                                ...s,
                                status: e.target.value,
                              }))
                            }
                          >
                            <option value="disponível">disponível</option>
                            <option value="alugado">alugado</option>
                            <option value="vencido">vencido</option>
                            <option value="fora de serviço">
                              fora de serviço
                            </option>
                          </select>
                          <select
                            className={styles.input}
                            value={editForm.category_id}
                            onChange={(e) =>
                              setEditForm((s) => ({
                                ...s,
                                category_id: e.target.value,
                              }))
                            }
                          >
                            <option value="">Categoria</option>
                            {categories.map((c) => (
                              <option key={c.category_id} value={c.category_id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.saveBtn}`}
                            onClick={() => saveEdit(p)}
                            disabled={saving}
                          >
                            {saving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            onClick={cancelEdit}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => startEdit(p)}
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
        <Footer />
    </div>
  );
}