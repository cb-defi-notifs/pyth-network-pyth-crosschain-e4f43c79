
let initial_guardians =
[
  "D2CC37A4dc036a8D232b48f62cDD4731412f4890",
  "54Ce5B4D348fb74B958e8966e2ec3dBd4958a7cd",
  "107A0086b32d7A0977926A205131d8731D39cbEB",
  "8192b6E7387CCd768277c17DAb1b7a5027c0b3Cf",
  "71AA1BE1D36CaFE3867910F99C09e347899C19C3",
  "114De8460193bdf3A2fCf81f86a09765F4762fD1",
  "74a3bf913953D695260D88BC1aA25A4eeE363ef0",
  "11b39756C042441BE6D8650b69b54EbE715E2343",
  "8C82B2fd82FaeD2711d59AF0F2499D16e726f6b2",
  "58CC3AE5C097b213cE3c81979e1B9f9570746AA5",
  "DA798F6896A3331F64b48c12D1D57Fd9cbe70811",
  "AF45Ced136b9D9e24903464AE889F5C8a723FC14",
  "f93124b7c738843CBB89E864c862c38cddCccF95",
  "fF6CB952589BDE862c25Ef4392132fb9D4A42157",
  "6FbEBc898F403E4773E95feB15E80C9A99c8348d",
  "000aC0076727b35FBea2dAc28fEE5cCB0fEA768e",
  "178e21ad2E77AE06711549CFBB1f9c7a9d8096e8",
  "5E1487F35515d02A92753504a8D75471b9f49EdB",
  "15e7cAF07C4e3DC8e7C469f92C8Cd88FB8005a20"
]

let ordered_guardians = [ // 5 is missing
    "58CC3AE5C097b213cE3c81979e1B9f9570746AA5",
    "fF6CB952589BDE862c25Ef4392132fb9D4A42157",
    "114De8460193bdf3A2fCf81f86a09765F4762fD1",
    "107A0086b32d7A0977926A205131d8731D39cbEB",
    "8C82B2fd82FaeD2711d59AF0F2499D16e726f6b2",
    "11b39756c042441be6d8650b69b54ebe715e2343",
    "54Ce5B4D348fb74B958e8966e2ec3dBd4958a7cd",
    "15e7cAF07C4e3DC8e7C469f92C8Cd88FB8005a20",
    "74a3bf913953D695260D88BC1aA25A4eeE363ef0",
    "000aC0076727b35FBea2dAc28fEE5cCB0fEA768e",
    "AF45Ced136b9D9e24903464AE889F5C8a723FC14",
    "f93124b7c738843CBB89E864c862c38cddCccF95",
    "D2CC37A4dc036a8D232b48f62cDD4731412f4890",
    "DA798F6896A3331F64b48c12D1D57Fd9cbe70811",
    "71AA1BE1D36CaFE3867910F99C09e347899C19C3",
    "8192b6E7387CCd768277c17DAb1b7a5027c0b3Cf",
    "178e21ad2E77AE06711549CFBB1f9c7a9d8096e8",
    "5E1487F35515d02A92753504a8D75471b9f49EdB",
    "6FbEBc898F403E4773E95feB15E80C9A99c8348d"
]

function main(){
    initial_guardians = initial_guardians.map(x=>x.toLowerCase())
    ordered_guardians = ordered_guardians.map(x=>x.toLowerCase())

    for (let g of initial_guardians){
        console.log("ordered_guardians.indexOf(g): ", ordered_guardians.indexOf(g))
        if (ordered_guardians.indexOf(g)<0){
            console.log("guardian is not in ordered_guardians: ", g)
        }
    }
}

main()
