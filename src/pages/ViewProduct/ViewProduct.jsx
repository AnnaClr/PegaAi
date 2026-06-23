import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, getProductImages, getProductOwner } from "./ViewProduct.helpers";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./ViewProduct.css";

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setLoggedUser(JSON.parse(storedUser));
      } catch (e) {
        setLoggedUser(null);
      }
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getProduct(id);
        if (!mounted) return;
        setProduct(p);

        const imgs = await getProductImages(id);
        if (!mounted) return;
        setImages(imgs || []);

        if (p && p.user_id) {
          const ownerData = await getProductOwner(p.user_id);
          if (!mounted) return;
          setOwner(ownerData);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Erro ao carregar produto.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    
    if (product.status?.toLowerCase() !== "disponível") {
      alert(`Este produto não está disponível para aluguel. Status atual: ${product.status}`);
      return;
    }

    try {
      const raw = localStorage.getItem("cart");
      const cart = raw ? JSON.parse(raw) : [];
      const exists = cart.find(
        (item) => Number(item.product_id) === Number(product.product_id),
      );
      if (exists) {
        navigate("/cart");
        return;
      }
      const newItem = {
        id: Date.now(),
        product_id: product.product_id,
        startDate: "",
        endDate: "",
        days: 0,
      };
      cart.push(newItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      navigate("/cart");
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho", err);
    }
  };

  const requestRent = () => {
    if (!product) return;
    
    if (product.status?.toLowerCase() !== "disponível") {
      alert(`Este produto não está disponível para aluguel. Status atual: ${product.status}`);
      return;
    }

    const item = {
      id: Date.now(),
      product_id: product.product_id,
      startDate: "",
      endDate: "",
      days: 0,
    };
    navigate("/checkout", {
      state: { cartItems: [item], paymentMethod: "card" },
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const imageUrls = images.map((img) => img.image_url);

  const isOwner = loggedUser && owner && Number(loggedUser.user_id) === Number(owner.user_id);
  const isAvailable = product?.status?.toLowerCase() === "disponível";

  return (
    <>
      <Header />
      <main className="view-product">
        {loading ? (
          <div className="skeleton">Carregando produto...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : product ? (
          <div className="view-product__container">
            <div className="view-product__gallery">
              <div className="main-image">
                {imageUrls.length > 0 ? (
                  <img src={imageUrls[selectedImage]} alt={product.name} />
                ) : (
                  <div className="no-image">Sem imagem disponível</div>
                )}
              </div>
              {imageUrls.length > 1 && (
                <div className="thumbnail-gallery">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImage === index ? "active" : ""}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={url} alt={`${product.name} - ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="view-product__details">
              <div className="details-card">
                <h2 className="product-name">{product.name}</h2>
                <div className="product-meta">
                  <span className="category">
                    {product.category ?? "Categoria"}
                  </span>
                  {product.status &&
                    (() => {
                      const s = (product.status || "").toLowerCase();
                      let statusClass = "";
                      if (s.includes("dispon")) statusClass = "status--available";
                      else if (s.includes("alug")) statusClass = "status--rented";
                      else if (s.includes("venc")) statusClass = "status--expired";
                      else if (s.includes("fora") || s.includes("serv")) statusClass = "status--outofservice";
                      return (
                        <span className={`status ${statusClass}`}>
                          {product.status}
                        </span>
                      );
                    })()}
                </div>

                <hr className="details-divider" />

                <h4>Descrição</h4>
                <p className="description">
                  {product.description || "Sem descrição disponível."}
                </p>

                <div className="purchase-row">
                  <div className="price-section">
                    <span className="price">
                      R$ {product.price_per_day?.toFixed(2) ?? "—"}
                    </span>
                    <span className="p-day">/ dia</span>
                  </div>
                  {product.max_days && (
                    <div className="max-days">
                      <strong>Máximo:</strong> {product.max_days} dias
                    </div>
                  )}
                  <div className="actions">
                    {isOwner ? (
                      <button className="btn btn-owner" disabled>
                        Seu produto
                      </button>
                    ) : isAvailable ? (
                      <>
                        <button className="btn btn-primary" onClick={requestRent}>
                          Solicitar aluguel
                        </button>
                        <button className="btn btn-outline" onClick={addToCart}>
                          Adicionar ao carrinho
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-unavailable" disabled>
                          Indisponível
                        </button>
                        <button className="btn btn-outline" onClick={addToCart}>
                          Adicionar ao carrinho
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="seller-card">
                <div className="seller-header">
                  <div className="seller-avatar">{getInitials(owner?.name)}</div>
                  <div>
                    <h4>{owner?.name ?? "Locador"}</h4>
                    <span className="seller-badge">Verificado</span>
                    {isOwner && <span className="owner-tag">(Você)</span>}
                  </div>
                </div>

                <hr className="seller-divider" />

                <div className="seller-info">
                  <div className="seller-info-item">
                    <span className="label">E-mail</span>
                    <span className="value">{owner?.email ?? "—"}</span>
                  </div>
                  <div className="seller-info-item">
                    <span className="label">Telefone</span>
                    <span className="value">{owner?.phone_number ?? "—"}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <p>Produto não encontrado.</p>
        )}
      </main>
      <Footer />
    </>
  );
}