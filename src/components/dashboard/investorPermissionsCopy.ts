const en = {
  add: 'Grant access',
  members: 'Select team members',
  hint: 'Select one or more people, then choose the permissions to add. Their existing permissions are kept.',
  access: 'People with access',
  empty: 'No investor permissions assigned yet.',
  saved: 'Permissions saved.',
  partial:
    'Some changes could not be saved. The list has been refreshed; retry the remaining selections.',
  remove: 'Remove access',
  search: 'Find a team member',
  noMatches: 'No matching team members.',
  inactive: 'Event team access is inactive',
  selected: 'selected',
  editHint: 'Change individual permissions below. Changes save immediately.',
};
type Copy = typeof en;
const fr: Copy = {
  add: 'Accorder les accès',
  members: 'Sélectionner les membres',
  hint: 'Sélectionnez une ou plusieurs personnes, puis les droits à ajouter. Leurs droits existants sont conservés.',
  access: 'Personnes autorisées',
  empty: 'Aucun accès investisseur attribué pour le moment.',
  saved: 'Autorisations enregistrées.',
  partial:
    'Certaines modifications ont échoué. La liste a été actualisée ; réessayez pour les personnes restantes.',
  remove: 'Retirer les accès',
  search: 'Rechercher un membre',
  noMatches: 'Aucun membre correspondant.',
  inactive: 'Accès à l’équipe désactivé',
  selected: 'sélectionné(s)',
  editHint:
    'Modifiez les droits de chaque personne ci-dessous. Les changements sont enregistrés immédiatement.',
};
const ar: Copy = {
  add: 'منح الصلاحيات',
  members: 'اختيار أعضاء الفريق',
  hint: 'اختر شخصًا أو أكثر ثم الصلاحيات التي تريد إضافتها. تُحفظ صلاحياتهم الحالية.',
  access: 'الأشخاص المخولون',
  empty: 'لم تُمنح صلاحيات المستثمرين بعد.',
  saved: 'تم حفظ الصلاحيات.',
  partial:
    'تعذر حفظ بعض التغييرات. تم تحديث القائمة؛ أعد المحاولة للأشخاص المتبقين.',
  remove: 'إزالة الصلاحيات',
  search: 'البحث عن عضو',
  noMatches: 'لا يوجد أعضاء مطابقون.',
  inactive: 'صلاحية فريق الحدث غير نشطة',
  selected: 'محدد',
  editHint: 'عدّل صلاحيات كل شخص أدناه. تُحفظ التغييرات فورًا.',
};
export const investorPermissionsCopy = { en, fr, ar };
