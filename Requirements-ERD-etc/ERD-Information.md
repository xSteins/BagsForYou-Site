# ERD yang akan digunakan dalam basis data

Gambar ERD :
![ERD](./ERD.png)

## ACCOUNT

Id_Account (PK)
Username
Password
E-mail
Nama_Lengkap
IsAdmin

## FOLLOW

Id_Account (PK,FK)
Id_Follower (PK,FK)

## REVIEW

Id_Review(PK)
Isi_Review
Bintang
Tanggal_Review
Id_Account(FK)
Id_Tas(FK)

## TAS

Id_Tas(PK)
Deskripsi
Warna
Dimensi
Id_Merk(FK)
Id_Designer(FK) Bisa NULL
Id_Subkategori(FK)

## MERK

Id_Merk(PK)
Nama_Merk

## DESIGNER

Id_Designer(PK)
Nama_Designer

## KATEGORI

Id_Kategori(PK)
Nama_Kategori

## SUB_KATEGORI

Id_Subkategori(PK)
Nama_Subkategori
Id_Kategori(PK,FK)
