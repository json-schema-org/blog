import Caption from './Caption'

export default function Figure ({ src, caption, widthClass, className }) {
  return (
    <figure className={className}>
      <img className={`${widthClass || 'w-full'} inline-block`} src={`${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ''}${src}`} />
      { caption && (<Caption>{caption}</Caption>) }
    </figure>
  )
}
