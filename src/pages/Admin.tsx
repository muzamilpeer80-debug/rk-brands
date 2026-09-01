
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { navigate } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { Product, Order, Profile, Coupon } from '@/lib/types';
import { formatINR } from '@/lib/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| ADMIN SECURITY
|--------------------------------------------------------------------------
|
| Only this email address is allowed to access the admin dashboard.
|
| IMPORTANT:
| The password must NOT be written in this frontend file.
| Create the account in Supabase Authentication instead.
|
*/

const ADMIN_EMAIL = 'muzamilpeer80@gmail.com';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'coupons';

export default function Admin() {
  const { session } = useAuth();

  const [tab, setTab] = useState<AdminTab>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | CHECK ADMIN LOGIN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      setLoading(false);

      navigate('/login');
      return;
    }

    const userEmail =
      session.user.email?.trim().toLowerCase();

    if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(false);
      setLoading(false);

      window.alert(
        'Access denied. Only the administrator can access this page.'
      );

      navigate('/');
      return;
    }

    setIsAdmin(true);
  }, [session]);

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadData = async () => {
      setLoading(true);

      try {
        const [
          productsResult,
          ordersResult,
          customersResult,
          couponsResult,
        ] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('orders')
            .select('*')
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('profiles')
            .select('*'),

          supabase
            .from('coupons')
            .select('*'),
        ]);

        if (productsResult.error) {
          console.error(
            'Products error:',
            productsResult.error
          );
        }

        if (ordersResult.error) {
          console.error(
            'Orders error:',
            ordersResult.error
          );
        }

        if (customersResult.error) {
          console.error(
            'Customers error:',
            customersResult.error
          );
        }

        if (couponsResult.error) {
          console.error(
            'Coupons error:',
            couponsResult.error
          );
        }

        setProducts(
          (productsResult.data || []) as Product[]
        );

        setOrders(
          (ordersResult.data || []) as Order[]
        );

        setCustomers(
          (customersResult.data || []) as Profile[]
        );

        setCoupons(
          (couponsResult.data || []) as Coupon[]
        );
      } catch (error) {
        console.error(
          'Failed to load admin data:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  /*
  |--------------------------------------------------------------------------
  | DELETE PRODUCT
  |--------------------------------------------------------------------------
  */

  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Delete product error:',
        error
      );

      window.alert(
        'Failed to delete the product.'
      );

      return;
    }

    setProducts((previousProducts) =>
      previousProducts.filter(
        (product) => product.id !== id
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE ORDER STATUS
  |--------------------------------------------------------------------------
  */

  const updateOrderStatus = async (
    id: string,
    status: string
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(
        'Update order error:',
        error
      );

      window.alert(
        'Failed to update order status.'
      );

      return;
    }

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PRODUCT
  |--------------------------------------------------------------------------
  */

  const saveProduct = async (
    productData: Record<string, unknown>
  ) => {
    try {
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();

        if (error) {
          console.error(
            'Update product error:',
            error
          );

          window.alert(
            'Failed to update the product.'
          );

          return;
        }

        if (data) {
          setProducts((previousProducts) =>
            previousProducts.map((product) =>
              product.id === editingProduct.id
                ? (data as Product)
                : product
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          console.error(
            'Create product error:',
            error
          );

          window.alert(
            'Failed to create the product.'
          );

          return;
        }

        if (data) {
          setProducts((previousProducts) => [
            data as Product,
            ...previousProducts,
          ]);
        }
      }

      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error(
        'Save product error:',
        error
      );

      window.alert(
        'Something went wrong while saving the product.'
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | WAIT FOR AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  if (!session) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | BLOCK NON-ADMIN USERS
  |--------------------------------------------------------------------------
  */

  if (!isAdmin) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const avgOrderValue =
    orders.length > 0
      ? totalRevenue / orders.length
      : 0;

  /*
  |--------------------------------------------------------------------------
  | SIDEBAR
  |--------------------------------------------------------------------------
  */

  const navItems = [
    {
      k: 'dashboard' as const,
      l: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      k: 'products' as const,
      l: 'Products',
      icon: Package,
    },
    {
      k: 'orders' as const,
      l: 'Orders',
      icon: ShoppingBag,
    },
    {
      k: 'customers' as const,
      l: 'Customers',
      icon: Users,
    },
    {
      k: 'coupons' as const,
      l: 'Coupons',
      icon: Ticket,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="pt-24 lg:pt-32 pb-20">
      <div className="container-lux">

        <Breadcrumbs
          crumbs={[
            {
              label: 'Admin',
            },
          ]}
        />

        <h1 className="font-display text-4xl lg:text-5xl mt-8 mb-12">
          Admin Dashboard
        </h1>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* SIDEBAR */}

          <aside className="lg:col-span-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">

              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.k}
                    type="button"
                    onClick={() =>
                      setTab(item.k)
                    }
                    className={`flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                      tab === item.k
                        ? 'bg-ink-900 text-ivory-50'
                        : 'text-ink-700 hover:bg-ivory-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />

                    {item.l}
                  </button>
                );
              })}

            </nav>
          </aside>

          {/* MAIN CONTENT */}

          <div className="lg:col-span-4">

            {loading ? (
              <div className="space-y-4">
                <div className="h-32 skeleton" />
                <div className="h-64 skeleton" />
              </div>
            ) : (
              <>

                {/* =====================================================
                    DASHBOARD
                ===================================================== */}

                {tab === 'dashboard' && (
                  <div className="animate-fade-in">

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                      {[
                        {
                          label: 'Revenue',
                          value:
                            formatINR(
                              totalRevenue
                            ),
                          icon: TrendingUp,
                        },
                        {
                          label: 'Orders',
                          value:
                            orders.length.toString(),
                          icon: ShoppingBag,
                        },
                        {
                          label: 'Products',
                          value:
                            products.length.toString(),
                          icon: Package,
                        },
                        {
                          label: 'Customers',
                          value:
                            customers.length.toString(),
                          icon: Users,
                        },
                      ].map((stat) => {
                        const Icon = stat.icon;

                        return (
                          <div
                            key={stat.label}
                            className="bg-ivory-100 p-6"
                          >
                            <div className="flex items-center justify-between mb-3">

                              <p className="text-[11px] uppercase tracking-[0.15em] text-ink-500">
                                {stat.label}
                              </p>

                              <Icon className="w-4 h-4 text-ink-400" />

                            </div>

                            <p className="font-display text-3xl">
                              {stat.value}
                            </p>
                          </div>
                        );
                      })}

                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">

                      <div className="bg-ivory-100 p-6">

                        <h3 className="font-display text-xl mb-4">
                          Avg Order Value
                        </h3>

                        <p className="font-display text-4xl mb-2">
                          {formatINR(
                            avgOrderValue
                          )}
                        </p>

                        <p className="text-xs text-ink-500">
                          Across {orders.length}{' '}
                          orders
                        </p>

                      </div>

                      <div className="bg-ivory-100 p-6">

                        <h3 className="font-display text-xl mb-4">
                          Recent Orders
                        </h3>

                        <div className="space-y-2">

                          {orders
                            .slice(0, 5)
                            .map((order) => (
                              <div
                                key={order.id}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-ink-600">
                                  {order.tracking_number ||
                                    order.id.slice(
                                      0,
                                      8
                                    )}
                                </span>

                                <span className="font-medium">
                                  {formatINR(
                                    order.total
                                  )}
                                </span>
                              </div>
                            ))}

                          {orders.length === 0 && (
                            <p className="text-sm text-ink-400">
                              No orders yet
                            </p>
                          )}

                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* =====================================================
                    PRODUCTS
                ===================================================== */}

                {tab === 'products' && (
                  <div className="animate-fade-in">

                    <div className="flex items-center justify-between mb-6">

                      <h2 className="font-display text-2xl">
                        Products ({products.length})
                      </h2>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setShowProductForm(true);
                        }}
                        className="btn-primary"
                      >
                        <Plus className="w-4 h-4" />

                        Add Product
                      </button>

                    </div>

                    <div className="overflow-x-auto">

                      <table className="w-full text-sm">

                        <thead>
                          <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-[0.15em] text-ink-500">

                            <th className="py-3 pr-4">
                              Product
                            </th>

                            <th className="py-3 px-4">
                              Category
                            </th>

                            <th className="py-3 px-4">
                              Price
                            </th>

                            <th className="py-3 px-4">
                              Stock
                            </th>

                            <th className="py-3 px-4">
                              Actions
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {products.map(
                            (product) => (
                              <tr
                                key={product.id}
                                className="border-b border-ink-100"
                              >

                                <td className="py-3 pr-4">

                                  <div className="flex items-center gap-3">

                                    <img
                                      src={
                                        product
                                          .images?.[0] ||
                                        ''
                                      }
                                      alt={
                                        product.name
                                      }
                                      className="w-10 h-12 object-cover"
                                    />

                                    <span className="font-medium">
                                      {product.name}
                                    </span>

                                  </div>

                                </td>

                                <td className="py-3 px-4 capitalize">
                                  {product.category}{' '}
                                  ·{' '}
                                  {product.type}
                                </td>

                                <td className="py-3 px-4">
                                  {formatINR(
                                    product.price
                                  )}
                                </td>

                                <td className="py-3 px-4">

                                  <span
                                    className={
                                      product.stock <=
                                      10
                                        ? 'text-accent-dark'
                                        : ''
                                    }
                                  >
                                    {product.stock}
                                  </span>

                                </td>

                                <td className="py-3 px-4">

                                  <div className="flex gap-2">

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProduct(
                                          product
                                        );
                                        setShowProductForm(
                                          true
                                        );
                                      }}
                                      className="p-1.5 hover:bg-ivory-100"
                                      title="Edit product"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteProduct(
                                          product.id
                                        )
                                      }
                                      className="p-1.5 hover:bg-ivory-100"
                                      title="Delete product"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                      {products.length === 0 && (
                        <p className="text-ink-400 py-8 text-center">
                          No products yet
                        </p>
                      )}

                    </div>
                  </div>
                )}

                {/* =====================================================
                    ORDERS
                ===================================================== */}

                {tab === 'orders' && (
                  <div className="animate-fade-in">

                    <h2 className="font-display text-2xl mb-6">
                      Orders ({orders.length})
                    </h2>

                    <div className="overflow-x-auto">

                      <table className="w-full text-sm">

                        <thead>
                          <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-[0.15em] text-ink-500">

                            <th className="py-3 pr-4">
                              Order
                            </th>

                            <th className="py-3 px-4">
                              Date
                            </th>

                            <th className="py-3 px-4">
                              Items
                            </th>

                            <th className="py-3 px-4">
                              Total
                            </th>

                            <th className="py-3 px-4">
                              Status
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {orders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-ink-100"
                            >

                              <td className="py-3 pr-4 font-medium">
                                {order.tracking_number ||
                                  order.id.slice(
                                    0,
                                    8
                                  )}
                              </td>

                              <td className="py-3 px-4 text-ink-500">
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString()}
                              </td>

                              <td className="py-3 px-4">
                                {order.items?.length ||
                                  0}
                              </td>

                              <td className="py-3 px-4 font-medium">
                                {formatINR(
                                  order.total
                                )}
                              </td>

                              <td className="py-3 px-4">

                                <select
                                  value={
                                    order.status
                                  }
                                  onChange={(event) =>
                                    updateOrderStatus(
                                      order.id,
                                      event.target
                                        .value
                                    )
                                  }
                                  className="bg-transparent border border-ink-200 px-2 py-1 text-xs capitalize focus:outline-none focus:border-ink-900"
                                >

                                  {[
                                    'processing',
                                    'shipped',
                                    'delivered',
                                    'cancelled',
                                  ].map(
                                    (status) => (
                                      <option
                                        key={status}
                                        value={status}
                                      >
                                        {status}
                                      </option>
                                    )
                                  )}

                                </select>

                              </td>

                            </tr>
                          ))}

                        </tbody>

                      </table>

                      {orders.length === 0 && (
                        <p className="text-ink-400 py-8 text-center">
                          No orders yet
                        </p>
                      )}

                    </div>
                  </div>
                )}

                {/* =====================================================
                    CUSTOMERS
                ===================================================== */}

                {tab === 'customers' && (
                  <div className="animate-fade-in">

                    <h2 className="font-display text-2xl mb-6">
                      Customers ({customers.length})
                    </h2>

                    <div className="overflow-x-auto">

                      <table className="w-full text-sm">

                        <thead>
                          <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-[0.15em] text-ink-500">

                            <th className="py-3 pr-4">
                              Name
                            </th>

                            <th className="py-3 px-4">
                              Phone
                            </th>

                            <th className="py-3 px-4">
                              Joined
                            </th>

                            <th className="py-3 px-4">
                              Orders
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {customers.map(
                            (customer) => {

                              const customerOrders =
                                orders.filter(
                                  (order) =>
                                    order.user_id ===
                                    customer.id
                                );

                              return (
                                <tr
                                  key={
                                    customer.id
                                  }
                                  className="border-b border-ink-100"
                                >

                                  <td className="py-3 pr-4 font-medium">
                                    {customer.full_name ||
                                      '—'}
                                  </td>

                                  <td className="py-3 px-4 text-ink-500">
                                    {customer.phone ||
                                      '—'}
                                  </td>

                                  <td className="py-3 px-4 text-ink-500">
                                    {new Date(
                                      customer.created_at
                                    ).toLocaleDateString()}
                                  </td>

                                  <td className="py-3 px-4">
                                    {
                                      customerOrders.length
                                    }
                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                      {customers.length === 0 && (
                        <p className="text-ink-400 py-8 text-center">
                          No customers yet
                        </p>
                      )}

                    </div>
                  </div>
                )}

                {/* =====================================================
                    COUPONS
                ===================================================== */}

                {tab === 'coupons' && (
                  <div className="animate-fade-in">

                    <h2 className="font-display text-2xl mb-6">
                      Coupons ({coupons.length})
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                      {coupons.map((c) => (
                        <div
                          key={c.id}
                          className="bg-ivory-100 p-6"
                        >

                          <p className="font-display text-2xl mb-2">
                            {c.code}
                          </p>

                          <p className="text-sm text-ink-600">

                            {c.discount_type ===
                            'percent'
                              ? `${c.value}% off`
                              : `₹${c.value} off`}

                          </p>

                          <p className="text-xs text-ink-400 mt-2">

                            Min: ₹
                            {c.min_subtotal}{' '}
                            ·{' '}
                            {c.active
                              ? 'Active'
                              : 'Inactive'}

                          </p>

                        </div>
                      ))}

                    </div>

                    {coupons.length === 0 && (
                      <p className="text-ink-400 py-8 text-center">
                        No coupons yet
                      </p>
                    )}

                  </div>
                )}

              </>
            )}

          </div>
        </div>
      </div>

      {/* ===============================================================
          PRODUCT FORM MODAL
      =============================================================== */}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={saveProduct}
        />
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| PRODUCT FORM
|--------------------------------------------------------------------------
*/

function ProductForm({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (
    product: Record<string, unknown>
  ) => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price
      ? (product.price / 100).toString()
      : '',
    category: product?.category || 'men',
    type: product?.type || 'shoes',
    collection: product?.collection || '',
    images:
      product?.images?.join('\n') || '',
    sizes:
      product?.sizes?.join(', ') || '',
    colors:
      product?.colors?.join(', ') || '',
    stock:
      product?.stock?.toString() || '0',
    featured:
      product?.featured || false,
    trending:
      product?.trending || false,
    is_new:
      product?.is_new || false,
  });

  /*
  |--------------------------------------------------------------------------
  | FORM SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      window.alert(
        'Please enter a valid price.'
      );
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      window.alert(
        'Please enter a valid stock quantity.'
      );
      return;
    }

    onSave({
      name: form.name.trim(),

      slug:
        form.slug.trim() ||
        form.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),

      description:
        form.description.trim(),

      price: Math.round(price * 100),

      category:
        form.category.toLowerCase(),

      type:
        form.type.toLowerCase(),

      collection:
        form.collection.trim() ||
        null,

      images: form.images
        .split('\n')
        .map((image) => image.trim())
        .filter(Boolean),

      sizes: form.sizes
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean),

      colors: form.colors
        .split(',')
        .map((color) => color.trim())
        .filter(Boolean),

      stock,

      featured: form.featured,

      trending: form.trending,

      is_new: form.is_new,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | FORM UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-ivory-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-scale-in">

        <div className="flex items-center justify-between mb-6">

          <h2 className="font-display text-2xl">
            {product
              ? 'Edit Product'
              : 'New Product'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div className="grid sm:grid-cols-2 gap-4">

            {/* NAME */}

            <div>
              <label className="label-lux">
                Name
              </label>

              <input
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name:
                      event.target.value,
                  }))
                }
                className="input-lux"
              />
            </div>

            {/* SLUG */}

            <div>
              <label className="label-lux">
                Slug
              </label>

              <input
                type="text"
                value={form.slug}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    slug:
                      event.target.value,
                  }))
                }
                className="input-lux"
                placeholder="auto-generated"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="label-lux">
                Price (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    price:
                      event.target.value,
                  }))
                }
                className="input-lux"
              />
            </div>

            {/* STOCK */}

            <div>
              <label className="label-lux">
                Stock
              </label>

              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    stock:
                      event.target.value,
                  }))
                }
                className="input-lux"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="label-lux">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    category:
                      event.target.value  as typeof previous.category,
                  }))
                }
                className="input-lux"
              >
                <option value="men">
                  Men
                </option>

                <option value="women">
                  Women
                </option>
              </select>
            </div>

            {/* TYPE */}

            <div>
              <label className="label-lux">
                Type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    type:
                      event.target.value as typeof previous.type,
                  }))
                }
                className="input-lux"
              >
                <option value="shoes">
                  Shoes
                </option>

                <option value="clothing">
                  Clothing
                </option>
              </select>
            </div>

            {/* COLLECTION */}

            <div>
              <label className="label-lux">
                Collection
              </label>

              <input
                type="text"
                value={form.collection}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    collection:
                      event.target.value,
                  }))
                }
                className="input-lux"
              />
            </div>

          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="label-lux">
              Description
            </label>

            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description:
                    event.target.value,
                }))
              }
              className="input-lux resize-none"
            />
          </div>

          {/* IMAGES */}

          <div>
            <label className="label-lux">
              Images (one URL per line)
            </label>

            <textarea
              rows={3}
              value={form.images}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  images:
                    event.target.value,
                }))
              }
              className="input-lux resize-none"
              placeholder="https://..."
            />
          </div>

          {/* SIZES + COLORS */}

          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <label className="label-lux">
                Sizes (comma separated)
              </label>

              <input
                type="text"
                value={form.sizes}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    sizes:
                      event.target.value,
                  }))
                }
                className="input-lux"
                placeholder="S, M, L"
              />
            </div>

            <div>
              <label className="label-lux">
                Colors (comma separated)
              </label>

              <input
                type="text"
                value={form.colors}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    colors:
                      event.target.value,
                  }))
                }
                className="input-lux"
                placeholder="Black, Ivory"
              />
            </div>

          </div>

          {/* CHECKBOXES */}

          <div className="flex gap-6">

            {[
              {
                k: 'featured' as const,
                l: 'Featured',
              },
              {
                k: 'trending' as const,
                l: 'Trending',
              },
              {
                k: 'is_new' as const,
                l: 'New Arrival',
              },
            ].map((field) => (
              <label
                key={field.k}
                className="flex items-center gap-2 cursor-pointer"
              >

                <input
                  type="checkbox"
                  checked={form[field.k]}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      [field.k]:
                        event.target.checked,
                    }))
                  }
                  className="accent-ink-900"
                />

                <span className="text-sm">
                  {field.l}
                </span>

              </label>
            ))}

          </div>

          {/* SAVE */}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            {product
              ? 'Save Changes'
              : 'Create Product'}
          </button>

        </form>
      </div>
    </div>
  );
}

