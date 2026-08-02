import { supabase } from './supabaseClient'

const DOCUMENT_TABLES = {
  noa: 'documents_noadocument',
  ntp: 'documents_ntpdocument',
  reso: 'documents_resodirectacquisition',
  reso_svp: 'documents_resosvp',
  reso_lov: 'documents_resolov',
  reso_emergency_split: 'documents_resoemergencysplit',
}

const SIGNATORIES_TABLE = 'documents_signatory'
const ACTIVITY_LOG_TABLE = 'documents_activitylog'

const tableName = (type) => DOCUMENT_TABLES[type] || type

export const fetchDocuments = async (type, options = {}) => {
  const table = tableName(type)
  let query = supabase.from(table).select('*')

  if (options.notDeleted) {
    query = query.eq('is_deleted', false)
  }

  if (options.orderBy) {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  return query
}

export const fetchAllDocuments = async () => {
  const entries = Object.entries(DOCUMENT_TABLES)
  const results = await Promise.all(
    entries.map(([_key, table]) => supabase.from(table).select('*'))
  )
  return entries.reduce((acc, [key], index) => {
    acc[key] = results[index].data || []
    acc[`${key}Error`] = results[index].error || null
    return acc
  }, {})
}

const buildDocumentPayload = (payload = {}) => {
  const normalized = { ...payload }
  if (normalized.date_created == null && normalized.created_at == null) {
    normalized.date_created = new Date().toISOString()
  }
  return normalized
}

export const createDocument = async (type, payload) => {
  const table = tableName(type)
  const { data, error } = await supabase.from(table).insert(buildDocumentPayload(payload)).select()
  return { data, error }
}

export const deleteDocument = async (type, id) => {
  const table = tableName(type)
  return supabase.from(table).delete().eq('id', id)
}

export const fetchSignatories = async (includeDeleted = false) => {
  let query = supabase.from(SIGNATORIES_TABLE).select('*')
  if (!includeDeleted) {
    query = query.eq('is_deleted', false)
  }
  return query
}

export const saveSignatory = async (signatory) => {
  const { id, ...payload } = signatory || {}
  if (id) {
    return supabase.from(SIGNATORIES_TABLE).update({
      name: payload.name,
      designation: payload.designation,
      role: payload.role,
    }).eq('id', id).select()
  }
  return supabase.from(SIGNATORIES_TABLE).insert({
    name: payload.name,
    designation: payload.designation,
    role: payload.role,
    is_deleted: false,
  }).select()
}

export const softDeleteSignatory = async (id) => {
  return supabase.from(SIGNATORIES_TABLE).update({ is_deleted: true }).eq('id', id)
}

export const restoreSignatory = async (id) => {
  return supabase.from(SIGNATORIES_TABLE).update({ is_deleted: false }).eq('id', id)
}

export const restoreDefaultSignatories = async () => {
  const defaults = [
    { name: 'ATTY. GLAIZA MAE MASAOY-ONIA', designation: 'Chairperson', role: 'Chairperson', is_deleted: false },
    { name: 'NENITA C. MADRIAGA', designation: 'Vice Chairperson', role: 'Vice Chairperson', is_deleted: false },
    { name: 'ATTY. ROMIN A. CADIENTE', designation: 'Member', role: 'Member', is_deleted: false },
    { name: 'BEN B. RIOS', designation: 'Member', role: 'Member', is_deleted: false },
    { name: 'BOBBY S. BAUTISTA', designation: 'Member', role: 'Member', is_deleted: false },
    { name: 'BOBBY S. BALTAZAR', designation: 'Member', role: 'Member', is_deleted: false },
    { name: 'MARIA ANA B. FRANCISCO, CESO III', designation: 'Regional Director', role: 'HOPE', is_deleted: false },
  ]

  return supabase.from(SIGNATORIES_TABLE).upsert(defaults, { onConflict: 'name' }).select()
}

export const fetchActivityLogs = async (limit = 10) => {
  return supabase.from(ACTIVITY_LOG_TABLE)
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
}

export const createActivityLog = async ({ user, action, description }) => {
  return supabase.from(ACTIVITY_LOG_TABLE).insert({ user, action, description }).select()
}

export const changePassword = async (newPassword) => {
  return supabase.auth.updateUser({ password: newPassword })
}

export const fetchDashboardStats = async () => {
  const entries = Object.entries(DOCUMENT_TABLES)
  const results = await Promise.all(
    entries.map(([_key, table]) => supabase.from(table).select('*'))
  )
  const data = entries.reduce((acc, [key], index) => {
    acc[key] = results[index].data || []
    return acc
  }, {})
  const activityLogs = await fetchActivityLogs(5)
  return {
    ...data,
    activityLogs: activityLogs.data || [],
    activityLogError: activityLogs.error || null,
  }
}

export const fetchReportsData = async () => {
  const entries = Object.entries(DOCUMENT_TABLES)
  const results = await Promise.all(
    entries.map(([_key, table]) => supabase.from(table).select('*'))
  )
  return entries.reduce((acc, [key], index) => {
    acc[key] = results[index].data || []
    acc[`${key}Error`] = results[index].error || null
    return acc
  }, {})
}
