import { createClient } from "@/lib/supabase/client";
import { Account, Transaction, Category, Budget, SavingsGoal, Bill, Notification, Profile, AppData } from "@/lib/types";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

function toSnakeAccount(a: Partial<Account>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (a.name !== undefined) r.name = a.name;
  if (a.type !== undefined) r.type = a.type;
  if (a.balance !== undefined) r.balance = a.balance;
  if (a.availableBalance !== undefined) r.available_balance = a.availableBalance;
  if (a.currency !== undefined) r.currency = a.currency;
  if (a.institution !== undefined) r.institution = a.institution;
  if ((a as Record<string, unknown>).lastUpdated !== undefined) r.last_updated = (a as Record<string, unknown>).lastUpdated;
  return r;
}

function toSnakeTransaction(t: Partial<Transaction>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (t.amount !== undefined) r.amount = t.amount;
  if (t.categoryId !== undefined) r.category_id = t.categoryId;
  if (t.accountId !== undefined) r.account_id = t.accountId;
  if (t.date !== undefined) r.date = t.date;
  if (t.notes !== undefined) r.notes = t.notes;
  if (t.receiptImage !== undefined) r.receipt_image = t.receiptImage;
  if (t.tags !== undefined) r.tags = t.tags;
  if (t.type !== undefined) r.type = t.type;
  return r;
}

function toSnakeBudget(b: Partial<Budget>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (b.categoryId !== undefined) r.category_id = b.categoryId;
  if (b.amount !== undefined) r.amount = b.amount;
  if (b.spent !== undefined) r.spent = b.spent;
  if (b.period !== undefined) r.period = b.period;
  if (b.startDate !== undefined) r.start_date = b.startDate;
  if (b.endDate !== undefined) r.end_date = b.endDate;
  return r;
}

function toSnakeSavingsGoal(g: Partial<SavingsGoal>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (g.name !== undefined) r.name = g.name;
  if (g.targetAmount !== undefined) r.target_amount = g.targetAmount;
  if (g.savedAmount !== undefined) r.saved_amount = g.savedAmount;
  if (g.deadline !== undefined) r.deadline = g.deadline;
  return r;
}

function toSnakeBill(b: Partial<Bill>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (b.name !== undefined) r.name = b.name;
  if (b.amount !== undefined) r.amount = b.amount;
  if (b.dueDate !== undefined) r.due_date = b.dueDate;
  if (b.autoPay !== undefined) r.auto_pay = b.autoPay;
  if (b.reminder !== undefined) r.reminder = b.reminder;
  if (b.paid !== undefined) r.paid = b.paid;
  if (b.accountId !== undefined) r.account_id = b.accountId;
  return r;
}

export const supabaseDb = {
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await getSupabase().from("accounts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await getSupabase().from("categories").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await getSupabase().from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await getSupabase().from("budgets").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await getSupabase().from("savings_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getContributions(goalId: string) {
    const { data, error } = await getSupabase().from("contributions").select("*").eq("goal_id", goalId).order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getBills(userId: string): Promise<Bill[]> {
    const { data, error } = await getSupabase().from("bills").select("*").eq("user_id", userId).order("due_date", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await getSupabase().from("notifications").select("*").eq("user_id", userId).order("time", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createAccount(userId: string, account: Partial<Account>) {
    const r = toSnakeAccount(account);
    r.user_id = userId;
    const { data, error } = await getSupabase().from("accounts").insert(r).select().single();
    if (error) throw error;
    return data;
  },

  async createTransaction(userId: string, transaction: Partial<Transaction>) {
    const r = toSnakeTransaction(transaction);
    r.user_id = userId;
    const { data, error } = await getSupabase().from("transactions").insert(r).select().single();
    if (error) throw error;
    return data;
  },

  async createCategory(userId: string, category: Partial<Category>) {
    const r: Record<string, unknown> = {};
    if (category.name !== undefined) r.name = category.name;
    if (category.type !== undefined) r.type = category.type;
    if (category.icon !== undefined) r.icon = category.icon;
    if (category.color !== undefined) r.color = category.color;
    if (category.budget !== undefined) r.budget = category.budget;
    r.user_id = userId;
    const { data, error } = await getSupabase().from("categories").insert(r).select().single();
    if (error) throw error;
    return data;
  },

  async createBudget(userId: string, budget: Partial<Budget>) {
    const r = toSnakeBudget(budget);
    r.user_id = userId;
    const { data, error } = await getSupabase().from("budgets").insert(r).select().single();
    if (error) throw error;
    return data;
  },

  async createSavingsGoal(userId: string, goal: Partial<SavingsGoal>) {
    const r = toSnakeSavingsGoal(goal);
    r.user_id = userId;
    const { data, error } = await getSupabase().from("savings_goals").insert(r).select().single();
    if (error) throw error;
    return data;
  },

  async createContribution(goalId: string, amount: number) {
    const { data, error } = await getSupabase().from("contributions").insert({ goal_id: goalId, amount, date: new Date().toISOString().split("T")[0] }).select().single();
    if (error) throw error;
    return data;
  },

  async createBill(userId: string, bill: Partial<Bill>) {
    const r = toSnakeBill(bill);
    r.user_id = userId;
    const { data, error } = await getSupabase().from("bills").insert(r).select().single();
    if (error) throw error;
    return data;
  },

  async updateAccount(id: string, updates: Partial<Account>) {
    const r = toSnakeAccount(updates);
    const { data, error } = await getSupabase().from("accounts").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const r = toSnakeTransaction(updates);
    const { data, error } = await getSupabase().from("transactions").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const r: Record<string, unknown> = {};
    if (updates.name !== undefined) r.name = updates.name;
    if (updates.type !== undefined) r.type = updates.type;
    if (updates.icon !== undefined) r.icon = updates.icon;
    if (updates.color !== undefined) r.color = updates.color;
    if (updates.budget !== undefined) r.budget = updates.budget;
    const { data, error } = await getSupabase().from("categories").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateBudget(id: string, updates: Partial<Budget>) {
    const r = toSnakeBudget(updates);
    const { data, error } = await getSupabase().from("budgets").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>) {
    const r = toSnakeSavingsGoal(updates);
    const { data, error } = await getSupabase().from("savings_goals").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateBill(id: string, updates: Partial<Bill>) {
    const r = toSnakeBill(updates);
    const { data, error } = await getSupabase().from("bills").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async updateNotification(id: string, updates: Partial<Notification>) {
    const r: Record<string, unknown> = {};
    if (updates.read !== undefined) r.read = updates.read;
    const { data, error } = await getSupabase().from("notifications").update(r).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAccount(id: string) {
    const { error } = await getSupabase().from("accounts").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteTransaction(id: string) {
    const { error } = await getSupabase().from("transactions").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteCategory(id: string) {
    const { error } = await getSupabase().from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteBudget(id: string) {
    const { error } = await getSupabase().from("budgets").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteSavingsGoal(id: string) {
    const { error } = await getSupabase().from("savings_goals").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteBill(id: string) {
    const { error } = await getSupabase().from("bills").delete().eq("id", id);
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await getSupabase().from("profiles").select("*").eq("id", userId).single();
    if (error) return null;
    return {
      id: data.id,
      email: data.email || "",
      fullName: data.full_name || "",
      currency: data.currency || "₱",
      timezone: data.timezone || "Asia/Manila",
      language: data.language || "en",
      theme: data.theme || "light",
    };
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    const { data, error } = await getSupabase().from("profiles").update(dbUpdates).eq("id", userId).select().single();
    if (error) throw error;
    return data;
  },

  async resetAllData(userId: string) {
    await getSupabase().from("savings_goals").delete().eq("user_id", userId);
    await getSupabase().from("budgets").delete().eq("user_id", userId);
    await getSupabase().from("transactions").delete().eq("user_id", userId);
    await getSupabase().from("bills").delete().eq("user_id", userId);
    await getSupabase().from("categories").delete().eq("user_id", userId);
    await getSupabase().from("accounts").delete().eq("user_id", userId);
    await getSupabase().from("notifications").delete().eq("user_id", userId);
  },
};
