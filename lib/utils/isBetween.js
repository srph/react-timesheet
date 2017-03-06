export default function isBetween(base, date1, date2) {
  return (base >= date1 && base <= date2) || (base <= date1 && base >= date2)
}

// StartA.isBetween(StartB, EndB)
// EndA.isBetween(StartB, EndB)
// StartB.isBetween(StartA, EndA)
// EndB.isBetween(StartA, EndA)