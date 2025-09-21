import TemplateItem from "../ui/TemplateItem";

export default function GroupTemplatesList({ templates, onEdit, onDeleted }) {
  return (
    <ul className="space-y-3">
      {templates.map((t) => (
        <TemplateItem
          key={t.idTaskTemplate}
          template={t}
          onEdit={onEdit}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
}
