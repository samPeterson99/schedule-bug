//@ts-nocheck
import { supabase } from "./../lib/supabaseClient";

function Page({ countries }) {
  if (countries) {
    return (
      <ul>
        {countries.map((country) => (
          <li key={country.id}>{country.name}</li>
        ))}
      </ul>
    );
  }
}

export async function getServerSideProps() {
  const { data } = await supabase.from("countries").select();

  console.log(data);
  return {
    props: {
      countries: data,
    },
  };
}

export default Page;
