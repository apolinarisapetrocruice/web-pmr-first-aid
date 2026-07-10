function mapImageToSection(materialId, sectionIndex, images) {
  if (!images || images.length === 0) return null;
  
  if (materialId === 'lm_3') {
    if (sectionIndex === 1 && images.length > 2) return images[2];
    if (sectionIndex === 2 && images.length > 0) return images[0];
    if (sectionIndex === 3 && images.length > 1) return images[1];
  }
  if (materialId === 'lm_4') {
    if (sectionIndex === 2 && images.length > 1) return images[1];
    if (sectionIndex === 3 && images.length > 2) return images[2];
  }
  if (materialId === 'lm_5') {
    if (sectionIndex === 0 && images.length > 0) return images[0];
    if (sectionIndex === 3 && images.length > 1) return images[1];
  }
  if (materialId === 'lm_6') {
    if (sectionIndex === 0 && images.length > 0) return images[0];
    if (sectionIndex === 1 && images.length > 1) return images[1];
    if (sectionIndex === 2 && images.length > 2) return images[2];
  }
  if (materialId === 'lm_7') {
    if (sectionIndex === 0 && images.length > 2) return images[2];
    if (sectionIndex === 1 && images.length > 1) return images[1];
    if (sectionIndex === 2 && images.length > 0) return images[0];
  }
  if (materialId === 'lm_8') {
    if (sectionIndex === 0 && images.length > 1) return images[1];
    if ((sectionIndex === 3 || sectionIndex === 4) && images.length > 0) return images[0];
    if (sectionIndex === 5 && images.length > 2) return images[2];
  }
  if (materialId === 'lm_9') {
    if (sectionIndex === 0 && images.length > 1) return images[1];
    if (sectionIndex === 1 && images.length > 0) return images[0];
  }
  return null;
}

export function parseSubTopics(rawContent, images, materialId) {
  const list = [];
  const cleanContent = rawContent.trim();
  
  // Split by headings ending with colon (handles both CRLF and LF)
  const sections = cleanContent.split(/\r?\n+(?=[A-Za-z0-9\s•\-\?\(\)]+:\r?\n+)/);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const colonIndex = section.indexOf(':');
    if (colonIndex !== -1) {
      let title = section.substring(0, colonIndex).trim();
      // Remove leading "Apa " (but not "Apa itu")
      title = title.replace(/^Apa\s+(?!itu\b)/i, '');

      const body = section.substring(colonIndex + 1).trim();
      const image = mapImageToSection(materialId, i, images);

      list.push({ title, content: body, imageAsset: image });
    } else {
      list.push({ title: 'Ikhtisar', content: section, imageAsset: null });
    }
  }
  return list;
}

export function getMaterialOverview(id) {
  switch (id) {
    case 'lm_1':
      return 'Pertolongan Pertama (PP) adalah pemberian bantuan segera kepada orang sakit atau cedera sebelum mendapat penanganan medis lanjutan. Di sini kita akan mempelajari dasar, pelaku, tujuan, kewajiban, dan etika penolong.';
    case 'lm_2':
      return 'Sebagai penolong pertama, keselamatan diri adalah yang utama. Pelajari tentang Alat Perlindungan Diri (APD) dan berbagai peralatan pertolongan pertama yang wajib dipersiapkan.';
    case 'lm_3':
      return 'Memahami struktur (anatomi) dan fungsi (faal) tubuh manusia sangat penting untuk melakukan penilaian cedera secara tepat dan melakukan tindakan medis dasar.';
    case 'lm_4':
      return 'Pelajari sistematika penilaian korban mulai dari menilai keadaan lingkungan sekitar, penilaian dini kondisi korban (kesadaran & pernapasan), hingga pemeriksaan fisik lengkap.';
    case 'lm_5':
      return 'Luka adalah kerusakan jaringan lunak. Pelajari klasifikasi luka terbuka dan tertutup, cara penanganan luka, serta teknik penutupan dan pembalutan yang benar.';
    case 'lm_6':
      return 'Patah tulang memerlukan penanganan khusus untuk mencegah cedera lebih lanjut. Pelajari tanda-tanda patah tulang dan cara melakukan pembidaian yang aman.';
    case 'lm_7':
      return 'Luka bakar dapat disebabkan oleh berbagai sumber seperti panas, kimia, atau listrik. Pelajari klasifikasi tingkat luka bakar dan pertolongan pertamanya.';
    case 'lm_8':
      return 'Pingsan merupakan kondisi kehilangan kesadaran sementara yang umumnya disebabkan oleh berkurangnya aliran darah ke otak. Penanganan yang cepat dapat mencegah cedera lebih lanjut.';
    case 'lm_9':
      return 'Pertolongan pertama pada cedera terkilir otot dan terkilir sendi dilakukan menggunakan metode RICE (Rest, Ice, Compression, dan Elevation) untuk mengurangi nyeri dan bengkak.';
    default:
      return 'Pelajari materi pertolongan pertama secara lengkap langkah demi langkah untuk membantu menyelamatkan jiwa dan mencegah cacat.';
  }
}
