import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { v4 as uuid } from 'uuid'
import {
  User,
  UserRole,
  UserStatus,
  Client,
  Supplier,
  Category,
  Product,
  ProductUnit,
  ProductStatus,
  Ingredient,
  IngredientUnit,
  Recipe,
  RecipeItem,
  Purchase,
  PurchaseStatus,
  PurchaseItem,
  StockMovement,
  MovementType,
  MovementReason,
  ProductionOrder,
  ProductionStatus,
  ProductionOrderItem,
} from '../entities'

export class FullDataSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // ── Guard: skip if already seeded ──────────────────────────────────────
    const existingProducts = await em.count(Product, {})
    if (existingProducts > 0) return

    // ── Fetch existing base data ────────────────────────────────────────────
    const admin = await em.findOneOrFail(User, { email: 'admin@superpao.com.br' })
    const categories = await em.find(Category, {})
    const catMap = Object.fromEntries(categories.map((c) => [c.name, c]))

    // ── Extra users ─────────────────────────────────────────────────────────
    const managerData = { name: 'Maria Gerente', email: 'gerente@superpao.com.br', password: 'Gerente@123', role: UserRole.MANAGER }
    const operatorData = { name: 'João Operador', email: 'operador@superpao.com.br', password: 'Operador@123', role: UserRole.OPERATOR }
    let manager = await em.findOne(User, { email: managerData.email })
    if (!manager) { manager = em.create(User, managerData as any); em.persist(manager) }
    let operator = await em.findOne(User, { email: operatorData.email })
    if (!operator) { operator = em.create(User, operatorData as any); em.persist(operator) }
    await em.flush()

    // ── Suppliers ───────────────────────────────────────────────────────────
    const suppliersData = [
      { razaoSocial: 'Moinho Santa Cruz Ltda', nomeFantasia: 'Moinho Santa Cruz', cnpj: '12.345.678/0001-90', contact: 'Carlos Silva', phone: '(11) 3456-7890', email: 'vendas@moinhosantacruz.com.br' },
      { razaoSocial: 'Distribuidora de Laticínios Bom Gosto S.A.', nomeFantasia: 'Bom Gosto', cnpj: '23.456.789/0001-01', contact: 'Ana Lima', phone: '(11) 4567-8901', email: 'comercial@bomgosto.com.br' },
      { razaoSocial: 'Levain Insumos Panificação ME', nomeFantasia: 'Levain', cnpj: '34.567.890/0001-12', contact: 'Pedro Alves', phone: '(11) 5678-9012', email: 'pedidos@levain.com.br' },
      { razaoSocial: 'Agroindústria Vale Verde Ltda', nomeFantasia: 'Vale Verde', cnpj: '45.678.901/0001-23', contact: 'Fernanda Costa', phone: '(11) 6789-0123', email: 'vendas@valeverde.com.br' },
      { razaoSocial: 'Embalagens Total Pack ME', nomeFantasia: 'Total Pack', cnpj: '56.789.012/0001-34', contact: 'Roberto Souza', phone: '(11) 7890-1234', email: 'contato@totalpack.com.br' },
    ]
    const suppliers: Supplier[] = []
    for (const s of suppliersData) {
      const sup = em.create(Supplier, s as any)
      em.persist(sup)
      suppliers.push(sup)
    }
    await em.flush()
    const [supMoinho, supLaticinios, supLevain, supValeVerde] = suppliers

    // ── Clients ─────────────────────────────────────────────────────────────
    const clientsData = [
      { name: 'Restaurante Sabor & Arte', cpfCnpj: '11.222.333/0001-44', phone: '(11) 91234-5678', email: 'compras@saborarte.com.br', address: 'Rua das Flores, 100 - Centro' },
      { name: 'Hotel Bela Vista', cpfCnpj: '22.333.444/0001-55', phone: '(11) 92345-6789', email: 'suprimentos@belavista.com.br', address: 'Av. Principal, 500 - Jardins' },
      { name: 'Padaria do Bairro', cpfCnpj: '33.444.555/0001-66', phone: '(11) 93456-7890', email: 'padariabairro@gmail.com', address: 'Rua Sete de Setembro, 45 - Vila Nova' },
      { name: 'Café Gourmet Central', cpfCnpj: '44.555.666/0001-77', phone: '(11) 94567-8901', email: 'compras@cafegourmet.com.br', address: 'Alameda Santos, 200 - Cerqueira César' },
      { name: 'Buffet Momentos Felizes', cpfCnpj: '55.666.777/0001-88', phone: '(11) 95678-9012', email: 'eventos@momentosfelizes.com.br', address: 'Rua das Acácias, 78 - Moema' },
      { name: 'Supermercado Família', cpfCnpj: '66.777.888/0001-99', phone: '(11) 96789-0123', email: 'compras@superfamilia.com.br', address: 'Av. Tucuruvi, 350 - Tucuruvi' },
      { name: 'Escola Municipal São Paulo', cpfCnpj: '77.888.999/0001-00', phone: '(11) 97890-1234', email: 'merienda@escola.sp.gov.br', address: 'Rua Escolar, 15 - Tatuapé' },
      { name: 'Maria das Graças Santos', cpfCnpj: '123.456.789-00', phone: '(11) 98901-2345', email: 'maria.graças@gmail.com', address: 'Rua Progresso, 22 - Santana' },
      { name: 'José Roberto Oliveira', cpfCnpj: '234.567.890-11', phone: '(11) 99012-3456', email: 'jose.roberto@hotmail.com', address: 'Rua da Liberdade, 88 - Liberdade' },
      { name: 'Ana Paula Ferreira', cpfCnpj: '345.678.901-22', phone: '(11) 99123-4567', email: 'ana.paula@gmail.com', address: 'Rua das Palmeiras, 33 - Pinheiros' },
    ]
    for (const c of clientsData) {
      em.persist(em.create(Client, c as any))
    }
    await em.flush()

    // ── Ingredients ─────────────────────────────────────────────────────────
    const ingredientsData = [
      { name: 'Farinha de Trigo Especial', unit: IngredientUnit.KG, costPrice: 3.50, currentStock: 120, minStock: 50, supplier: supMoinho },
      { name: 'Farinha de Trigo Integral', unit: IngredientUnit.KG, costPrice: 4.80, currentStock: 30, minStock: 40, supplier: supMoinho },
      { name: 'Açúcar Refinado', unit: IngredientUnit.KG, costPrice: 3.20, currentStock: 80, minStock: 30, supplier: supValeVerde },
      { name: 'Açúcar Mascavo', unit: IngredientUnit.KG, costPrice: 5.60, currentStock: 15, minStock: 20, supplier: supValeVerde },
      { name: 'Sal Refinado', unit: IngredientUnit.KG, costPrice: 1.20, currentStock: 25, minStock: 10, supplier: supLevain },
      { name: 'Fermento Biológico Seco', unit: IngredientUnit.G, costPrice: 0.08, currentStock: 2000, minStock: 1000, supplier: supLevain },
      { name: 'Fermento Químico em Pó', unit: IngredientUnit.G, costPrice: 0.05, currentStock: 1500, minStock: 500, supplier: supLevain },
      { name: 'Manteiga sem Sal', unit: IngredientUnit.KG, costPrice: 32.00, currentStock: 18, minStock: 10, supplier: supLaticinios },
      { name: 'Margarina Culinária', unit: IngredientUnit.KG, costPrice: 12.00, currentStock: 25, minStock: 15, supplier: supLaticinios },
      { name: 'Ovos Frescos', unit: IngredientUnit.UN, costPrice: 0.95, currentStock: 200, minStock: 120, supplier: supValeVerde },
      { name: 'Leite Integral', unit: IngredientUnit.L, costPrice: 4.50, currentStock: 8, minStock: 20, supplier: supLaticinios },
      { name: 'Creme de Leite', unit: IngredientUnit.L, costPrice: 8.90, currentStock: 12, minStock: 8, supplier: supLaticinios },
      { name: 'Chocolate em Pó 50%', unit: IngredientUnit.KG, costPrice: 22.00, currentStock: 10, minStock: 5, supplier: supLevain },
      { name: 'Chocolate ao Leite Cobertura', unit: IngredientUnit.KG, costPrice: 35.00, currentStock: 6, minStock: 8, supplier: supLevain },
      { name: 'Baunilha Extrato Natural', unit: IngredientUnit.ML, costPrice: 0.25, currentStock: 500, minStock: 200, supplier: supLevain },
      { name: 'Canela em Pó', unit: IngredientUnit.KG, costPrice: 18.00, currentStock: 2, minStock: 1, supplier: supLevain },
      { name: 'Gergelim Branco', unit: IngredientUnit.KG, costPrice: 15.00, currentStock: 5, minStock: 3, supplier: supValeVerde },
      { name: 'Nozes Picadas', unit: IngredientUnit.KG, costPrice: 65.00, currentStock: 2, minStock: 3, supplier: supValeVerde },
      { name: 'Recheio de Coco Ralado', unit: IngredientUnit.KG, costPrice: 12.00, currentStock: 8, minStock: 5, supplier: supValeVerde },
      { name: 'Óleo de Soja', unit: IngredientUnit.L, costPrice: 6.50, currentStock: 20, minStock: 10, supplier: supValeVerde },
    ]
    const ingredients: Ingredient[] = []
    for (const i of ingredientsData) {
      const ing = em.create(Ingredient, i as any)
      em.persist(ing)
      ingredients.push(ing)
    }
    await em.flush()

    const [
      ingFarinha, ingFarinhaInt, ingAcucar, ingAcucarMascavo, ingSal,
      ingFermBio, ingFermQuim, ingManteiga, ingMargarina, ingOvos,
      ingLeite, ingCremeleite, ingChocPo, ingChocCobert, ingBaunilha,
      ingCanela, ingGergelim, ingNozes, ingCoco, ingOleo,
    ] = ingredients

    // ── Products ─────────────────────────────────────────────────────────────
    const productsData = [
      { name: 'Pão Francês', code: 'PAO001', category: catMap['Pães'], unit: ProductUnit.UN, costPrice: 0.28, salePrice: 0.65, currentStock: 150, minStock: 100 },
      { name: 'Pão de Forma Integral', code: 'PAO002', category: catMap['Pães'], unit: ProductUnit.UN, costPrice: 4.50, salePrice: 9.90, currentStock: 20, minStock: 15 },
      { name: 'Pão de Queijo', code: 'PAO003', category: catMap['Pães'], unit: ProductUnit.UN, costPrice: 0.85, salePrice: 2.00, currentStock: 80, minStock: 60 },
      { name: 'Ciabatta', code: 'PAO004', category: catMap['Brioches e Especiais'], unit: ProductUnit.UN, costPrice: 1.80, salePrice: 4.50, currentStock: 30, minStock: 20 },
      { name: 'Brioche', code: 'PAO005', category: catMap['Brioches e Especiais'], unit: ProductUnit.UN, costPrice: 2.20, salePrice: 5.50, currentStock: 15, minStock: 20 },
      { name: 'Bolo de Chocolate', code: 'BOL001', category: catMap['Bolos'], unit: ProductUnit.UN, costPrice: 18.00, salePrice: 42.00, currentStock: 5, minStock: 3 },
      { name: 'Bolo de Cenoura com Cobertura', code: 'BOL002', category: catMap['Bolos'], unit: ProductUnit.UN, costPrice: 15.00, salePrice: 36.00, currentStock: 4, minStock: 3 },
      { name: 'Bolo de Banana', code: 'BOL003', category: catMap['Bolos'], unit: ProductUnit.UN, costPrice: 12.00, salePrice: 28.00, currentStock: 6, minStock: 3 },
      { name: 'Coxinha de Frango', code: 'SAL001', category: catMap['Salgados'], unit: ProductUnit.UN, costPrice: 1.20, salePrice: 3.50, currentStock: 60, minStock: 40 },
      { name: 'Esfiha de Carne', code: 'SAL002', category: catMap['Salgados'], unit: ProductUnit.UN, costPrice: 1.10, salePrice: 3.00, currentStock: 45, minStock: 40 },
      { name: 'Croissant Simples', code: 'CRO001', category: catMap['Croissants e Folhados'], unit: ProductUnit.UN, costPrice: 2.50, salePrice: 6.50, currentStock: 25, minStock: 20 },
      { name: 'Croissant de Chocolate', code: 'CRO002', category: catMap['Croissants e Folhados'], unit: ProductUnit.UN, costPrice: 3.20, salePrice: 8.00, currentStock: 18, minStock: 20 },
      { name: 'Brigadeiro Tradicional', code: 'DOC001', category: catMap['Doces'], unit: ProductUnit.UN, costPrice: 0.90, salePrice: 2.50, currentStock: 50, minStock: 30 },
      { name: 'Trufa de Chocolate Belga', code: 'DOC002', category: catMap['Doces'], unit: ProductUnit.UN, costPrice: 2.80, salePrice: 7.00, currentStock: 20, minStock: 15 },
      { name: 'Cookie de Gotas de Chocolate', code: 'BIS001', category: catMap['Biscoitos e Cookies'], unit: ProductUnit.UN, costPrice: 0.70, salePrice: 2.00, currentStock: 80, minStock: 50 },
      { name: 'Cookie de Aveia e Mel', code: 'BIS002', category: catMap['Biscoitos e Cookies'], unit: ProductUnit.UN, costPrice: 0.65, salePrice: 1.80, currentStock: 70, minStock: 50 },
      { name: 'Torta de Limão', code: 'TOR001', category: catMap['Tortas'], unit: ProductUnit.UN, costPrice: 22.00, salePrice: 55.00, currentStock: 3, minStock: 2 },
      { name: 'Quiche de Alho-Poró', code: 'TOR002', category: catMap['Tortas'], unit: ProductUnit.UN, costPrice: 18.00, salePrice: 45.00, currentStock: 2, minStock: 2 },
      { name: 'Café Espresso', code: 'BEB001', category: catMap['Bebidas'], unit: ProductUnit.UN, costPrice: 1.20, salePrice: 5.00, currentStock: 0, minStock: 0 },
      { name: 'Suco de Laranja Natural', code: 'BEB002', category: catMap['Bebidas'], unit: ProductUnit.UN, costPrice: 2.50, salePrice: 8.00, currentStock: 0, minStock: 0 },
    ]
    const products: Product[] = []
    for (const p of productsData) {
      const margin = p.salePrice > 0
        ? Number((((p.salePrice - p.costPrice) / p.salePrice) * 100).toFixed(2))
        : 0
      const prod = em.create(Product, { ...p, margin, status: ProductStatus.ACTIVE } as any)
      em.persist(prod)
      products.push(prod)
    }
    await em.flush()

    const [
      pPaoFrances, pPaoFormaInt, pPaoQueijo, pCiabatta, pBrioche,
      pBoloCho, pBoloCenoura, pBoloBanana, pCoxinha, pEsfiha,
      pCroissant, pCroissantCho, pBrigadeiro, pTrufa, pCookieCho,
      pCookieAveia, pTortaLimao, pQuiche,
    ] = products

    // ── Recipes ──────────────────────────────────────────────────────────────
    const recipesData = [
      {
        product: pPaoFrances, yieldQty: 20, yieldUnit: 'UN',
        instructions: 'Misturar farinha, sal, fermento e água. Sovar por 10 min. Descansar 1h. Modelar. Assar 200°C por 15 min.',
        items: [
          { ingredient: ingFarinha, quantity: 1.0, unit: 'KG' },
          { ingredient: ingSal, quantity: 0.02, unit: 'KG' },
          { ingredient: ingFermBio, quantity: 10, unit: 'G' },
        ],
      },
      {
        product: pBoloCho, yieldQty: 1, yieldUnit: 'UN',
        instructions: 'Misturar ingredientes secos. Adicionar ovos, leite e óleo. Assar 180°C por 40 min. Cobrir com ganache.',
        items: [
          { ingredient: ingFarinha, quantity: 0.3, unit: 'KG' },
          { ingredient: ingAcucar, quantity: 0.35, unit: 'KG' },
          { ingredient: ingChocPo, quantity: 0.08, unit: 'KG' },
          { ingredient: ingFermQuim, quantity: 10, unit: 'G' },
          { ingredient: ingOvos, quantity: 3, unit: 'UN' },
          { ingredient: ingLeite, quantity: 0.24, unit: 'L' },
          { ingredient: ingOleo, quantity: 0.12, unit: 'L' },
          { ingredient: ingChocCobert, quantity: 0.15, unit: 'KG' },
        ],
      },
      {
        product: pBoloCenoura, yieldQty: 1, yieldUnit: 'UN',
        instructions: 'Bater cenoura, ovos e óleo. Adicionar farinha, açúcar e fermento. Assar 180°C por 35 min.',
        items: [
          { ingredient: ingFarinha, quantity: 0.25, unit: 'KG' },
          { ingredient: ingAcucar, quantity: 0.30, unit: 'KG' },
          { ingredient: ingFermQuim, quantity: 8, unit: 'G' },
          { ingredient: ingOvos, quantity: 3, unit: 'UN' },
          { ingredient: ingOleo, quantity: 0.10, unit: 'L' },
          { ingredient: ingChocCobert, quantity: 0.20, unit: 'KG' },
        ],
      },
      {
        product: pCroissant, yieldQty: 10, yieldUnit: 'UN',
        instructions: 'Preparar massa folhada. Laminar com manteiga. Cortar triângulos. Enrolar. Provar 2h. Assar 200°C por 18 min.',
        items: [
          { ingredient: ingFarinha, quantity: 0.5, unit: 'KG' },
          { ingredient: ingAcucar, quantity: 0.06, unit: 'KG' },
          { ingredient: ingSal, quantity: 0.01, unit: 'KG' },
          { ingredient: ingFermBio, quantity: 8, unit: 'G' },
          { ingredient: ingManteiga, quantity: 0.25, unit: 'KG' },
          { ingredient: ingLeite, quantity: 0.15, unit: 'L' },
        ],
      },
      {
        product: pCookieCho, yieldQty: 20, yieldUnit: 'UN',
        instructions: 'Cremar manteiga com açúcar. Adicionar ovos e baunilha. Misturar farinha e fermento. Dobrar gotas de chocolate. Assar 175°C por 12 min.',
        items: [
          { ingredient: ingFarinha, quantity: 0.28, unit: 'KG' },
          { ingredient: ingAcucar, quantity: 0.20, unit: 'KG' },
          { ingredient: ingManteiga, quantity: 0.15, unit: 'KG' },
          { ingredient: ingOvos, quantity: 2, unit: 'UN' },
          { ingredient: ingBaunilha, quantity: 5, unit: 'ML' },
          { ingredient: ingFermQuim, quantity: 5, unit: 'G' },
          { ingredient: ingChocCobert, quantity: 0.15, unit: 'KG' },
        ],
      },
      {
        product: pBrigadeiro, yieldQty: 30, yieldUnit: 'UN',
        instructions: 'Misturar leite condensado, chocolate em pó e manteiga. Cozinhar até desgrudar. Enrolar depois de frio.',
        items: [
          { ingredient: ingChocPo, quantity: 0.04, unit: 'KG' },
          { ingredient: ingManteiga, quantity: 0.02, unit: 'KG' },
        ],
      },
    ]

    for (const r of recipesData) {
      const recipe = em.create(Recipe, {
        product: r.product,
        yieldQty: r.yieldQty,
        yieldUnit: r.yieldUnit,
        instructions: r.instructions,
      } as any)
      em.persist(recipe)
      for (const item of r.items) {
        em.persist(em.create(RecipeItem, { recipe, ...item } as any))
      }
    }
    await em.flush()

    // ── Purchases (with items and stock movements) ────────────────────────────
    const now = new Date()
    const thisMonth = (daysAgo: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - daysAgo)
      return d
    }

    const purchasesData = [
      {
        supplier: supMoinho,
        status: PurchaseStatus.RECEIVED,
        purchaseDate: thisMonth(20),
        invoiceNumber: 'NF-001234',
        items: [
          { ingredient: ingFarinha, quantity: 100, unitPrice: 3.50 },
          { ingredient: ingFarinhaInt, quantity: 25, unitPrice: 4.80 },
        ],
      },
      {
        supplier: supLaticinios,
        status: PurchaseStatus.RECEIVED,
        purchaseDate: thisMonth(15),
        invoiceNumber: 'NF-005678',
        items: [
          { ingredient: ingManteiga, quantity: 20, unitPrice: 32.00 },
          { ingredient: ingLeite, quantity: 30, unitPrice: 4.50 },
          { ingredient: ingCremeleite, quantity: 15, unitPrice: 8.90 },
        ],
      },
      {
        supplier: supLevain,
        status: PurchaseStatus.RECEIVED,
        purchaseDate: thisMonth(10),
        invoiceNumber: 'NF-009012',
        items: [
          { ingredient: ingFermBio, quantity: 3000, unitPrice: 0.08 },
          { ingredient: ingFermQuim, quantity: 2000, unitPrice: 0.05 },
          { ingredient: ingChocPo, quantity: 12, unitPrice: 22.00 },
          { ingredient: ingChocCobert, quantity: 10, unitPrice: 35.00 },
          { ingredient: ingBaunilha, quantity: 700, unitPrice: 0.25 },
        ],
      },
      {
        supplier: supValeVerde,
        status: PurchaseStatus.RECEIVED,
        purchaseDate: thisMonth(8),
        invoiceNumber: 'NF-011223',
        items: [
          { ingredient: ingAcucar, quantity: 80, unitPrice: 3.20 },
          { ingredient: ingOvos, quantity: 300, unitPrice: 0.95 },
          { ingredient: ingOleo, quantity: 20, unitPrice: 6.50 },
          { ingredient: ingCoco, quantity: 10, unitPrice: 12.00 },
        ],
      },
      {
        supplier: supMoinho,
        status: PurchaseStatus.PENDING,
        purchaseDate: thisMonth(2),
        invoiceNumber: 'NF-015000',
        items: [
          { ingredient: ingFarinha, quantity: 50, unitPrice: 3.50 },
          { ingredient: ingFarinhaInt, quantity: 20, unitPrice: 4.80 },
          { ingredient: ingSal, quantity: 30, unitPrice: 1.20 },
        ],
      },
      {
        supplier: supLaticinios,
        status: PurchaseStatus.PENDING,
        purchaseDate: thisMonth(1),
        invoiceNumber: 'NF-016000',
        items: [
          { ingredient: ingLeite, quantity: 50, unitPrice: 4.50 },
          { ingredient: ingMargarina, quantity: 20, unitPrice: 12.00 },
        ],
      },
    ]

    for (const p of purchasesData) {
      let totalValue = 0
      const purchaseItems: Array<{ ingredient: Ingredient; quantity: number; unitPrice: number }> = []
      for (const item of p.items) {
        const totalPrice = item.quantity * item.unitPrice
        totalValue += totalPrice
        purchaseItems.push(item)
      }

      const purchase = em.create(Purchase, {
        supplier: p.supplier,
        createdBy: admin,
        status: p.status,
        purchaseDate: p.purchaseDate,
        invoiceNumber: p.invoiceNumber,
        totalValue,
      } as any)
      em.persist(purchase)

      for (const item of purchaseItems) {
        const totalPrice = item.quantity * item.unitPrice
        em.persist(em.create(PurchaseItem, {
          purchase,
          ingredient: item.ingredient,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
        } as any))

        // Stock movement only for RECEIVED purchases
        if (p.status === PurchaseStatus.RECEIVED) {
          const prev = item.ingredient.currentStock
          const newStock = prev + item.quantity
          item.ingredient.currentStock = newStock
          em.persist(em.create(StockMovement, {
            type: MovementType.IN,
            reason: MovementReason.PURCHASE,
            ingredient: item.ingredient,
            quantity: item.quantity,
            previousStock: prev,
            newStock,
            createdBy: admin,
            referenceId: purchase.id,
            referenceType: 'Purchase',
          } as any))
        }
      }
    }
    await em.flush()

    // ── Production Orders ─────────────────────────────────────────────────────
    const recipes = await em.find(Recipe, {}, { populate: ['product', 'items', 'items.ingredient'] })
    const recipeMap = new Map(recipes.map((r) => [r.product.id, r]))

    const completedDate = (daysAgo: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - daysAgo)
      return d
    }

    const productionData: Array<{
      product: Product; qty: number; status: ProductionStatus;
      scheduledDaysAgo: number; completedDaysAgo?: number
    }> = [
      { product: pPaoFrances, qty: 200, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 18, completedDaysAgo: 18 },
      { product: pBoloCho, qty: 8, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 16, completedDaysAgo: 16 },
      { product: pCroissant, qty: 60, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 14, completedDaysAgo: 14 },
      { product: pCookieCho, qty: 100, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 12, completedDaysAgo: 12 },
      { product: pBrigadeiro, qty: 150, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 10, completedDaysAgo: 10 },
      { product: pPaoFrances, qty: 300, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 7, completedDaysAgo: 7 },
      { product: pBoloCenoura, qty: 6, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 5, completedDaysAgo: 5 },
      { product: pCroissantCho, qty: 40, status: ProductionStatus.COMPLETED, scheduledDaysAgo: 3, completedDaysAgo: 3 },
      { product: pPaoFrances, qty: 250, status: ProductionStatus.IN_PROGRESS, scheduledDaysAgo: 0 },
      { product: pBoloCho, qty: 10, status: ProductionStatus.PENDING, scheduledDaysAgo: -1 },
      { product: pCoxinha, qty: 100, status: ProductionStatus.PENDING, scheduledDaysAgo: -2 },
    ]

    for (const pd of productionData) {
      const recipe = recipeMap.get(pd.product.id)
      if (!recipe) continue

      const scheduledDate = completedDate(pd.scheduledDaysAgo)
      const order = em.create(ProductionOrder, {
        product: pd.product,
        recipe,
        quantity: pd.qty,
        scheduledDate,
        responsible: manager,
        status: pd.status,
        completedAt: pd.completedDaysAgo !== undefined ? completedDate(pd.completedDaysAgo) : undefined,
      } as any)
      em.persist(order)

      // Production order items (required ingredients)
      const scaleFactor = pd.qty / recipe.yieldQty
      for (const recipeItem of recipe.items) {
        const requiredQty = recipeItem.quantity * scaleFactor
        const consumedQty = pd.status === ProductionStatus.COMPLETED ? requiredQty : undefined
        em.persist(em.create(ProductionOrderItem, {
          order,
          ingredient: recipeItem.ingredient,
          requiredQty,
          consumedQty,
        } as any))

        // Stock movement OUT for completed productions
        if (pd.status === ProductionStatus.COMPLETED) {
          const prev = recipeItem.ingredient.currentStock
          const newStock = Math.max(0, prev - requiredQty)
          recipeItem.ingredient.currentStock = newStock
          em.persist(em.create(StockMovement, {
            type: MovementType.OUT,
            reason: MovementReason.PRODUCTION,
            ingredient: recipeItem.ingredient,
            quantity: requiredQty,
            previousStock: prev,
            newStock,
            createdBy: manager,
            referenceId: order.id,
            referenceType: 'ProductionOrder',
          } as any))

          // Update product stock
          pd.product.currentStock = Number(pd.product.currentStock) + pd.qty
        }
      }
    }
    await em.flush()
  }
}
