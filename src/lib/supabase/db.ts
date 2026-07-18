import { createClient } from "@/lib/supabase/server";
import { Account, Transaction, Category, Budget, SavingsGoal, Bill, Notification, AppData } from "@/lib/types";

export class SupabaseService {
  static async getAccounts(userId: string): Promise<Account[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getCategories(userId: string): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getTransactions(userId: string): Promise<Transaction[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getBudgets(userId: string): Promise<Budget[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("budgets").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("savings_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getContributions(goalId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("contributions").select("*").eq("goal_id", goalId).order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getBills(userId: string): Promise<Bill[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("bills").select("*").eq("user_id", userId).order("due_date", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("time", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createAccount(userId: string, account: Omit<Account, "id" | "user_id" | "created_at" | "last_updated">) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("accounts").insert({ ...account, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  static async createTransaction(userId: string, transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("transactions").insert({ ...transaction, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  static async createCategory(userId: string, category: Omit<Category, "id" | "user_id" | "created_at">) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").insert({ ...category, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  static async createBudget(userId: string, budget: Omit<Budget, "id" | "user_id" | "created_at">) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("budgets").insert({ ...budget, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  static async createSavingsGoal(userId: string, goal: Omit<SavingsGoal, "id" | "user_id" | "created_at">) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("savings_goals").insert({ ...goal, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  static async createContribution(goalId: string, amount: number) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("contributions").insert({ goal_id: goalId, amount }).select().single();
    if (error) throw error;
    return data;
  }

  static async createBill(userId: string, bill: Omit<Bill, "id" | "user_id" | "created_at">) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("bills").insert({ ...bill, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  static async updateAccount(id: string, updates: Partial<Account>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("accounts").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("transactions").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateCategory(id: string, updates: Partial<Category>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateBudget(id: string, updates: Partial<Budget>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("budgets").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("savings_goals").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateBill(id: string, updates: Partial<Bill>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("bills").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateNotification(id: string, updates: Partial<Notification>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("notifications").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteAccount(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
  }

  static async deleteTransaction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  }

  static async deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  }

  static async deleteBudget(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) throw error;
  }

  static async deleteSavingsGoal(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) throw error;
  }

  static async deleteBill(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) throw error;
  }
}
